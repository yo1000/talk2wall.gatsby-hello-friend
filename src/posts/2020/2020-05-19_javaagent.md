---
title: Java agent をつくってみる
path: /javaagent
date: 2020-05-19T00:00:00.000+09:00
author: yo1000
tags:
  - Tech
  - Java
  - Maven
---

Java agent を使うことはあっても作ったことないなと思い、調べつつ作ってみたのでそのメモ。

## 環境要件
- Java 8

```
java -version
openjdk version "1.8.0_212"
OpenJDK Runtime Environment Corretto-8.212.04.1 (build 1.8.0_212-b04)
OpenJDK 64-Bit Server VM Corretto-8.212.04.1 (build 25.212-b04, mixed mode)
```


## サンプルコード
- https://github.com/yo1000/demo-javaagent
- https://github.com/yo1000/demo-javaagent-jetty


## エージェントパッケージの作成
まず作成をするにあたって、エージェントパッケージの要件を確認します。
エージェントであるためには、以下の要件を満たす必要があります。

1. `premain` メソッドが実装されていること
2. マニフェストファイルで `premain` の位置が指定されていること
3. 依存クラスへのパスが通っていること

それでは作っていきます。

### premain メソッドの実装
`premain` メソッドは通常の Java アプリケーションでいうところの `main` メソッドと同様のもので、
ここがエージェントのエントリポイントとなります。

`main` メソッドとは受ける引数に違いがあり、`premain` では、以下いずれかのシグネチャを用意する必要があります。

- `public static void premain(String agentArgs)`
- `public static void premain(String agentArgs, Instrumentation instrumentation)`

#### agentArgs
`String agentArgs` は、`main` メソッドの `String[] args` に近いもので、
エージェントに与えた引数文字列を受け取ることができます。

`main` メソッドとは異なり、`String[]` 型にはなっておらず、単なる `String` 型の引数になっているのは、
エージェントが単一文字列しか引数として受け取ることができないためです。
そのため、複数のパラメタをわたしたい場合は、URL のクエリ文字列のようなパースをしたり、JSON 文字列として扱う等、
パラメタの受け取り方を決めておく必要があります。

#### instrumentation
`Instrumentation instrumentation` はエージェント特有のもので、バイトコードの追加を目的に使用されるものです。
ここでのバイトコード追加の主な目的は、アプリケーションの計測やロギング機能を追加することで、
NewRelic エージェントなどはこの機能を使用することで、
`instrumentation` を通して動的にクラスパスの追加などを行っています。

#### コード例
以下はエージェント起動すると、`agentArgs` の値を標準出力に書き出し、
その後、バックグラウンドで1秒毎にカウントアップしつつ、その値を標準出力に書き出し続けるだけのコードです。

```java
package com.yo1000.demo.javaagent;

import java.lang.instrument.Instrumentation;

public class DemoAgent {
    public static void premain(String agentArgs, Instrumentation instrumentation) {
        System.out.println("Run Demo agent");
        System.out.println(agentArgs);

        Thread thread = new Thread("Demo agent") {
            @Override
            public void run() {
                int count = 1;
                while (true) {
                    System.out.println("Demo thread running " + count++);
                    sleepUnhandled(1000L);
                }
            }

            void sleepUnhandled(long millis) {
                try {
                    sleep(millis);
                } catch (InterruptedException e) {
                    // Unhandled
                    // e.printStackTrace();
                }
            }
        };
        thread.setDaemon(true);
        thread.start();
    }
}
```

### マニフェストファイルの準備
JAR パッケージ内に `Premain-Class` 属性の設定されたマニフェストファイル (`MANIFEST.MF`) を同梱する必要があります。
同梱の方法については、`maven-jar-plugin` を使って同梱する方法や、
`maven-assembly-plugin` を使って生成、同梱する方法がありますが、
今回は、続く3番目の手順 **依存クラスへのパスが通っていること** に必要な、依存 JAR の展開にも使える
`maven-assembly-plugin` を使った例を以下に挙げておきます。
(サンプルコードでは、Gradle を使用した場合の書き方も併載しているので、必要に応じて参考にしてみてください。)

11行目で `Premain-Class` 属性をマニフェストファイルに含ませるように設定しています。
設定する値は `premain` メソッドの定義されているクラスの FQCN です。

```xml{numberLines:true}{11}
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-assembly-plugin</artifactId>
    <version>2.4</version>
    <configuration>
        <descriptorRefs>
            <descriptorRef>jar-with-dependencies</descriptorRef>
        </descriptorRefs>
        <archive>
            <manifestEntries>
                <Premain-Class>com.yo1000.demo.javaagent.DemoAgent</Premain-Class>
            </manifestEntries>
        </archive>
        <appendAssemblyId>false</appendAssemblyId>
    </configuration>
    <executions>
        <execution>
            <phase>package</phase>
            <goals>
                <goal>single</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

### 依存 JAR にクラスパスを通す
もし外部 JAR になにか依存したエージェントであった場合、これらモジュールをパッケージに同梱する必要があります。
単に JAR ファイルのまま含めればよいわけではなく、JAR ファイルに含まれるクラス群を含める必要があります。

外部 JAR の展開、および同梱は前述の `maven-assembly-plugin` で行えます。
すでに先の例で設定済みですが、`<descriptorRef>jar-with-dependencies</descriptorRef>` を設定することで、
JAR の展開と内容物の同梱ができます。

### 動作確認
ここまで作ったものを実際に動かして確認してみます。
適当な Java アプリケーションを用意して、こちらも Executable JAR として準備しておきます。
[Spring Initializr](https://start.spring.io/) あたりを使ってサクッと用意します。

エージェントを動かすには、Java アプリケーションの起動時に `-javaagent` 引数を使い、
コロン (`:`) でエージェントパッケージをつないで指定します。
なおエージェントに引数を渡したい場合は、パッケージの後ろにイコール (`=`) をつないで渡します。

```bash
java \
  -javaagent:/agent/jar/file/path/demo-agent.jar=testArg1=AAA,testArg2=BBB \
  -jar /main/jar/file/path/demo-main.jar
```

先の例のとおりに実装した場合、標準出力に `testArg1=AAA,testArg2=BBB` が書き出され、
その後、1秒毎にカウントアップする数字が書き出されたかと思います。

このように、エージェントは作成要件さえ確認してしまえば、比較的簡単に実装できてしまいます。
簡単な一方で、後付可能な機能としてはバイトコードの追加等もサポートされていることから、
非常に多岐に渡り、使い方次第でさまざまな機能を提供できます。


## 参考
- https://docs.oracle.com/javase/jp/8/docs/api/java/lang/instrument/Instrumentation.html
- https://maven.apache.org/plugins/maven-assembly-plugin/index.html
- https://stackoverflow.com/a/15888136/5610904
