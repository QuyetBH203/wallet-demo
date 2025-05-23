import type { RouteObject } from 'react-router-dom'
import React from 'react'
import DefaultPage from './pages/default-page'
import CreateWalletPage from './pages/create-wallet'
import ImportWalletPage from './pages/import-wallet'
import LoginPage from './pages/login'
import TransactionsPage from './pages/transaction-page'

export const routes: RouteObject[] = [
  { path: '/', element: React.createElement(DefaultPage) },
  { path: '/create-wallet', element: React.createElement(CreateWalletPage) },
  { path: '/import-wallet', element: React.createElement(ImportWalletPage) },
  { path: '/login', element: React.createElement(LoginPage) },
  { path: '/transactions', element: React.createElement(TransactionsPage) }
]
