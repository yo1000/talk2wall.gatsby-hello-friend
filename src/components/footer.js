import React from 'react'
import PropTypes from 'prop-types'

const Footer = ({ copyrights }) => (
  <footer>
    {copyrights ? (
      <div
        dangerouslySetInnerHTML={{
          __html: copyrights,
        }}
      />
    ) : (
      <>
        <div className="footerCopyrights">
          Copyright (C) 2017-{new Date().getFullYear()} <a href="https://github.com/yo1000" target="_blank" rel="noopener noreferrer">yo1000 | YO!CHI KIKUCHI</a>
        </div>
        <div className="footerCopyrights">
          Copyright (C) 2019 Built with <a href="https://www.gatsbyjs.org" target="_blank" rel="noopener noreferrer">Gatsby</a> | Starter created by <a href="https://radoslawkoziel.pl" target="_blank" rel="noopener noreferrer">panr</a>
        </div>
        <div className="footerCopyrights">
          Copyright (C) 1999, 2019 <a href="https://www.jp.square-enix.com/ffviii/guideline.html" target="_blank" rel="noopener noreferrer">SQUARE ENIX CO., LTD.</a> All Rights Reserved.
        </div>
      </>
    )}
  </footer>
)

Footer.propTypes = {
  copyrights: PropTypes.string,
}

export default Footer
