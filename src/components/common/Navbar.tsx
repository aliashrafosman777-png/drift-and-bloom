// @ts-nocheck
"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { FiMenu, FiX, FiUser, FiShoppingBag, FiChevronDown, FiLogOut } from 'react-icons/fi'
import Logo from './Logo'
import Container from './Container'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Packages', to: '/packages' },
  { label: 'Build Your Package', to: '/build-your-package' },
  { label: 'Find Your Soul', to: '/find-your-soul' },
  { label: 'Support', to: '/support' },
]

type NavLinkItem = (typeof NAV_LINKS)[number]

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function DesktopNavLink({ link, pathname }: { link: NavLinkItem; pathname: string }) {
  const isActive = isActivePath(pathname, link.to)

  return (
    <Link
      key={link.to}
      href={link.to}
      aria-current={isActive ? 'page' : undefined}
      className="group relative px-1 py-2 text-xs xl:text-sm uppercase tracking-label text-charcoal/70 transition duration-300 hover:text-olive"
    >
      <span className={isActive ? 'text-olive' : ''}>{link.label}</span>
      <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-olive transition-transform duration-300 group-hover:scale-x-100" />
      {isActive && (
        <motion.span
          layoutId="nav-active-underline"
          className="absolute bottom-0 left-0 h-px w-full bg-olive"
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        />
      )}
    </Link>
  )
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { itemCount } = useCart()
  const { user, isAuthenticated, logout } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        scrolled
          ? 'border-gold/20 bg-cream/90 shadow-soft backdrop-blur-xl'
          : 'border-charcoal/10 bg-cream/95'
      }`}
    >
      <Container className="flex items-center justify-between py-4">
        <Logo />

        <nav className="hidden lg:flex items-center gap-5 xl:gap-8" aria-label="Primary navigation">
          {NAV_LINKS.map((link) => (
            <DesktopNavLink key={link.to} link={link} pathname={pathname} />
          ))}
        </nav>

        <div className="flex items-center gap-4 sm:gap-5">
          <div className="relative hidden sm:block">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setAccountOpen((o) => !o)}
              aria-label="Account menu"
              aria-expanded={accountOpen}
              className="flex items-center gap-1 rounded-full text-charcoal/70 transition duration-300 hover:text-olive"
            >
              <FiUser size={19} />
              <FiChevronDown size={12} className={`transition duration-300 ${accountOpen ? 'rotate-180' : ''}`} />
            </motion.button>
            <AnimatePresence>
              {accountOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-gold/15 bg-white/95 py-2 shadow-lift backdrop-blur z-50"
                  onMouseLeave={() => setAccountOpen(false)}
                >
                  {isAuthenticated ? (
                    <>
                      <p className="px-4 py-2 text-xs text-charcoal/50">
                        Signed in as <span className="text-charcoal">{user.name}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          logout()
                          setAccountOpen(false)
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-charcoal/80 transition duration-300 hover:bg-beige"
                      >
                        <FiLogOut size={14} /> Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setAccountOpen(false)}
                        className="block px-4 py-2.5 text-sm text-charcoal/80 transition duration-300 hover:bg-beige"
                      >
                        Log in
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setAccountOpen(false)}
                        className="block px-4 py-2.5 text-sm text-charcoal/80 transition duration-300 hover:bg-beige"
                      >
                        Create account
                      </Link>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div whileHover={{ scale: 1.07, rotate: -2 }} whileTap={{ scale: 0.95 }}>
            <Link href="/cart" aria-label="View cart" className="relative block text-charcoal/70 transition duration-300 hover:text-olive">
              <FiShoppingBag size={20} />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    className="absolute -top-2 -right-2 bg-olive text-cream text-[10px] leading-none rounded-full w-[18px] h-[18px] flex items-center justify-center"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </motion.div>

          <motion.button
            whileTap={{ scale: 0.94 }}
            className="lg:hidden text-charcoal"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </motion.button>
        </div>
      </Container>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="lg:hidden overflow-hidden border-t border-charcoal/10 bg-cream/98 backdrop-blur"
          >
            <Container className="flex flex-col py-4 gap-1">
              {NAV_LINKS.map((link, index) => {
                const isActive = isActivePath(pathname, link.to)

                return (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.035, duration: 0.22 }}
                  >
                    <Link
                      href={link.to}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => setMobileOpen(false)}
                      className={`block rounded-xl px-2 py-3 text-sm uppercase tracking-label border-b border-charcoal/5 transition duration-300 ${
                        isActive ? 'bg-olive/5 text-olive' : 'text-charcoal/70 hover:bg-beige/70 hover:text-olive'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                )
              })}
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    setMobileOpen(false)
                  }}
                  className="rounded-xl px-2 py-3 text-left text-sm uppercase tracking-label text-charcoal/70 transition duration-300 hover:bg-beige/70"
                >
                  Log out ({user.name})
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-2 py-3 text-sm uppercase tracking-label text-charcoal/70 transition duration-300 hover:bg-beige/70"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-2 py-3 text-sm uppercase tracking-label text-charcoal/70 transition duration-300 hover:bg-beige/70"
                  >
                    Create account
                  </Link>
                </>
              )}
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
