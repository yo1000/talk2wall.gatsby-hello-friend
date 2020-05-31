import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Link, graphql, StaticQuery } from 'gatsby'
import { Helmet } from 'react-helmet'

import Menu from './menu'
import SearchBox from './searchBox'

import style from '../styles/header.module.css'

const Header = props => {
  const {
    siteLogo,
    logoText,
    mainMenu,
    mainMenuItems,
    menuMoreText,
    defaultTheme,
  } = props
  const defaultThemeState =
    (typeof window !== 'undefined' && window.localStorage.getItem('theme')) ||
    null
  const [userTheme, changeTheme] = useState(defaultThemeState)
  const [isMobileMenuVisible, toggleMobileMenu] = useState(false)
  const [isSubMenuVisible, toggleSubMenu] = useState(false)
  const onChangeTheme = () => {
    const opositeTheme =
      (userTheme || defaultTheme) === 'light' ? 'dark' : 'light'

    changeTheme(opositeTheme)

    typeof window !== 'undefined' &&
      window.localStorage.setItem('theme', opositeTheme)
  }
  const onToggleMobileMenu = () => toggleMobileMenu(!isMobileMenuVisible)
  const onToggleSubMenu = () => toggleSubMenu(!isSubMenuVisible)

  return (<StaticQuery
    query={graphql`
            query SearchIndexQuery {
                siteSearchIndex {
                    index
                }
            }
        `}
    render={data => (
      <>
      <Helmet>
        <link href="https://fonts.googleapis.com/css?family=Lato:400,700|Noto+Sans+JP:400,700&display=swap" rel="stylesheet" async/>
        <body
          className={
            (userTheme || defaultTheme) === 'light'
              ? 'light-theme'
              : 'dark-theme'
          }
        />
      </Helmet>
      <header className={style.header}>
        <div className={style.inner}>
          <Link to="/">
            <div className={style.logo + ' nav-logo-container'}>
              {siteLogo.src ? (
                <img src={siteLogo.src} alt={siteLogo.alt} />
              ) : (
                <>
                  <span className={style.mark + ' mark'}>></span>
                  <span className={style.text + ' text'}>{logoText}</span>
                  <span className={style.cursor + ' cursor'} />
                </>
              )}
            </div>
          </Link>
          <SearchBox searchIndex={data.siteSearchIndex.index} />
          <span className={style.right}>
            <Menu
              mainMenu={mainMenu}
              mainMenuItems={mainMenuItems}
              isMobileMenuVisible={isMobileMenuVisible}
              isSubMenuVisible={isSubMenuVisible}
              menuMoreText={menuMoreText}
              onToggleMobileMenu={onToggleMobileMenu}
              onToggleSubMenu={onToggleSubMenu}
              onChangeTheme={onChangeTheme}
            />
          </span>
        </div>
      </header>
      </>
    )}/>
  )
  // return (
  //   <>
  //     <Helmet>
  //       <link href="https://fonts.googleapis.com/css?family=Lato:400,700|Noto+Sans+JP:400,700" rel="stylesheet"/>
  //       <body
  //         className={
  //           (userTheme || defaultTheme) === 'light'
  //             ? 'light-theme'
  //             : 'dark-theme'
  //         }
  //       />
  //     </Helmet>
  //     <header className={style.header}>
  //       <div className={style.inner}>
  //         <Link to="/">
  //           <div className={style.logo + ' nav-logo-container'}>
  //             {siteLogo.src ? (
  //               <img src={siteLogo.src} alt={siteLogo.alt} />
  //             ) : (
  //               <>
  //                 <span className={style.mark + ' mark'}>></span>
  //                 <span className={style.text + ' text'}>{logoText}</span>
  //                 <span className={style.cursor + ' cursor'} />
  //               </>
  //             )}
  //           </div>
  //         </Link>
  //         <span className={style.right}>
  //           <Menu
  //             mainMenu={mainMenu}
  //             mainMenuItems={mainMenuItems}
  //             isMobileMenuVisible={isMobileMenuVisible}
  //             isSubMenuVisible={isSubMenuVisible}
  //             menuMoreText={menuMoreText}
  //             onToggleMobileMenu={onToggleMobileMenu}
  //             onToggleSubMenu={onToggleSubMenu}
  //             onChangeTheme={onChangeTheme}
  //           />
  //         </span>
  //       </div>
  //     </header>
  //   </>
  // )
}

Header.propTypes = {
  siteLogo: PropTypes.object,
  logoText: PropTypes.string,
  defaultTheme: PropTypes.string,
  mainMenu: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      path: PropTypes.string,
    }),
  ),
  mainMenuItems: PropTypes.number,
  menuMoreText: PropTypes.string,
}

export default Header
