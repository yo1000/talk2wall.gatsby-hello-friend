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
          Copyright (C) 2019 Built with <a href="https://www.gatsbyjs.org">Gatsby</a> | Starter created by <a href="https://radoslawkoziel.pl">panr</a>
        </div>
        <div className="footerCopyrights">
          Copyright (C) 2017-{new Date().getFullYear()} yo1000 | YO!CHI KIKUCHI
        </div>
        <div className="footerCopyrights">
          Copyright (C) 1999, 2019 SQUARE ENIX CO., LTD. All Rights Reserved.
        </div>
      </>
    )}
  </footer>
)

Footer.propTypes = {
  copyrights: PropTypes.string,
}

export default Footer
