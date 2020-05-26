import React from 'react'
import { StaticQuery, graphql } from 'gatsby'
import Img from 'gatsby-image'

const StaticImage = ({relativePath, className}) => (
  <StaticQuery
    query={graphql`
      query {
        images: allFile {
          edges {
            node {
              relativePath
              name
              childImageSharp {
                sizes(maxWidth: 800) {
                  ...GatsbyImageSharpSizes
                }
              }
            }
          }
        }
      }
    `}

    render={(data) => {
      const image = data.images.edges.find(n => {
        return n.node.relativePath.includes(relativePath)
      })

      if (!image) return
      
      const imageSizes = image.node.childImageSharp.sizes
      return <Img　sizes={imageSizes} className={className} />
    }}
  />
)

export default StaticImage
