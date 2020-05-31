import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'
import SEO from '../components/seo'
import Layout from '../components/layout'
import Post from '../components/post'
import Navigation from '../components/navigation'
import StaticImage from '../components/staticImage'

const Index = ({
  data,
  pageContext: {
    nextPagePath,
    previousPagePath
  }
}) => {
  const {
    allMarkdownRemark: { edges: posts },
  } = data

  return (
    <>
      <SEO />
      <Layout>
        <div class="main-logo-container">
          <StaticImage relativePath="logo/cover.png" className="cover" />
          <StaticImage relativePath="logo/logo.png" className="logo" />
        </div>

        <div class="index post-container">
          {posts.map(({ node }) => {
            const {
              id,
              excerpt: autoExcerpt,
              frontmatter: {
                title,
                date,
                path,
                author,
                coverImage,
                excerpt,
                tags,
              },
            } = node

            return (
              <Post
                key={id}
                title={title}
                date={date}
                path={path}
                author={author}
                coverImage={coverImage}
                tags={tags}
                excerpt={excerpt || autoExcerpt}
              />
            )
          })}
        </div>

        <Navigation
          previousPath={previousPagePath}
          previousLabel="Newer posts"
          nextPath={nextPagePath}
          nextLabel="Older posts"
        />
      </Layout>
    </>
  )
}

Index.propTypes = {
  data: PropTypes.object.isRequired,
  pageContext: PropTypes.shape({
    nextPagePath: PropTypes.string,
    previousPagePath: PropTypes.string,
  }),
}

export const postsQuery = graphql`
  query($limit: Int!, $skip: Int!) {
    allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "//posts//" } }
      sort: { fields: [frontmatter___date], order: DESC }
      limit: $limit
      skip: $skip
    ) {
      edges {
        node {
          id
          excerpt
          frontmatter {
            title
            date(formatString: "YYYY-MM-DD")
            path
            author
            excerpt
            tags
            coverImage {
              childImageSharp {
                fluid(maxWidth: 800) {
                  ...GatsbyImageSharpFluid
                }
              }
            }
          }
        }
      }
    }
  }
`

export default Index
