---
title: Executable JAR のリソースを参照する
path: /jar-resource
date: 2020-05-18T00:00:00.000+09:00
author: yo1000
tags:
  - Tech
  - Kotlin
  - Java
---

リソース取得なんてどうせ `getResource` でしょとタカをくくっていたらハマってしまったので、Executable JAR (実行可能JAR) のリソース取得では、ここに気をつけようというのを残しておきます。

## 環境要件
- Java 8
- Kotlin 1.3

```
java -version
openjdk version "1.8.0_212"
OpenJDK Runtime Environment Corretto-8.212.04.1 (build 1.8.0_212-b04)
OpenJDK 64-Bit Server VM Corretto-8.212.04.1 (build 25.212-b04, mixed mode)
```


## サンプルコード
https://github.com/yo1000/demo-config-props-vars/blob/master/src/main/kotlin/com/yo1000/demo/DemoApplication.kt


## リソースの取得
手順としては以下のようになります。

1. 実行中コードの URL を取得する
2. URL を整形して JAR ファイルのパスを取得する
3. JAR ファイル内のエントリから必要なファイルを取得する

問題はこの手順の最初、(1) の部分にあります。通常はここで `getResource` から URL を取得しても問題ありません。
が、実行環境に依らず必ず問題ないわけでもない、というのがハマったポイントでした。

より具体的には `javaagent` を使用して、NewRelic のエージェントを同時に起動しようとしていた場合に問題が発生しました。
Java Agent は、Executable JAR の main 関数の前に実行されるため、
この段階でクラスローダー等に手を加えられると、`getResource` の結果が変わってくる可能性があります。
実際、NewRelic の Java Agent を使用すると、`getResource` は実行した JAR からのリソースパスではなく、
`newrelic.jar` からのリソースパスを返すようになります。

そうなると、Executable JAR 自身の URL ではなくなってしまうので、意図したファイルを見つけることができず、
(3) の手順で失敗してしまう、ということが起こります。

では実際にどのように取得すればよいか、という部分ですが、以下のようにします。

```kotlin
// Kotlin
val resource: URL = DemoApplication::class.java.protectionDomain.codeSource.location
```

```java
// Java
URL resource = DemoApplication.getClass().getProtectionDomain().getCodeSource().getLocation();
```

これでクラスローダーに依存せず、実行中コードの URL が取得できるようになり、(3) の手順でも、
意図したファイルが取得できるようになります。

以下、Kotlin で JAR ファイル内のマニフェストファイルの属性から `Implementation-Version` を取得する場合の例を挙げておきます。

```kotlin{numberLines:true}
fun getImplementationVersion(): String? {
	val jarPath: String = getSelfJarPath() ?: return null
	val manifest: Manifest = JarFile(jarPath).manifest

	val implVersionName = Attributes.Name("Implementation-Version")
	return manifest.mainAttributes.takeIf {
		it.containsKey(implVersionName)
	}?.let {
		it[implVersionName].toString()
	}
}

fun getSelfJarPath(): String? {
	val resource = DemoApplication::class.java.protectionDomain.codeSource.location

	if (resource.protocol.toLowerCase() != "jar" || !resource.path.matches(Regex("^file:/[^!]+!/.*$"))) {
		return null
	}

	val matched: MatchResult = Regex("^file:(/[^!]+)!/.*").find(resource.path) ?: return null
	return matched.groupValues[1]
}
```


## 参考
- https://github.com/yo1000/demo-config-props-vars/blob/master/src/main/kotlin/com/yo1000/demo/DemoApplication.kt
- https://stackoverflow.com/a/320595/5610904
