// @ts-nocheck
"use client"

import React, { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Mail,
  MailOpen,
  Send,
  Reply,
  Calendar,
  AlertTriangle,
  MessageSquare,
  User,
  Phone,
} from 'lucide-react'
import { apiFetch } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

const STATUS_BADGE = {
  unread: 'bg-blue-100 text-blue-700 border-blue-200',
  read: 'bg-gray-100 text-gray-600 border-gray-200',
  replied: 'bg-green-100 text-green-700 border-green-200',
}

const STATUS_LABEL = {
  unread: 'Unread',
  read: 'Read',
  replied: 'Replied',
}

export default function AdminMessages() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [replying, setReplying] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchMessages = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({ page: String(page), limit: '15' })
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)

      const res = await apiFetch(`/api/admin/messages?${params.toString()}`)
      setMessages(res.data?.messages || [])
      setPagination(res.data?.pagination || { page: 1, pages: 1, total: 0 })
      setUnreadCount(res.data?.unreadCount || 0)
    } catch (err) {
      setError(err.message || 'Failed to load messages')
      setMessages([])
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    const timer = setTimeout(() => fetchMessages(1), 300)
    return () => clearTimeout(timer)
  }, [fetchMessages])

  const openMessage = async (msg) => {
    setSelectedMessage(msg)
    setReplyText('')

    if (!msg.isRead) {
      try {
        await apiFetch(`/api/admin/messages/${msg._id}`, {
          method: 'PATCH',
          body: JSON.stringify({ isRead: true }),
        })
        setMessages((prev) =>
          prev.map((m) =>
            m._id === msg._id
              ? { ...m, isRead: true, status: m.status === 'replied' ? 'replied' : 'read' }
              : m
          )
        )
        setUnreadCount((c) => Math.max(0, c - 1))
      } catch {}
    }
  }

  const handleReply = async () => {
    if (!replyText.trim() || !selectedMessage) return
    try {
      setReplying(true)
      const res = await apiFetch(`/api/admin/messages/${selectedMessage._id}`, {
        method: 'POST',
        body: JSON.stringify({
          content: replyText.trim(),
          adminName: user?.name || 'Admin',
          adminEmail: user?.email || '',
        }),
      })

      const now = new Date().toISOString()
      const newReply = {
        content: replyText.trim(),
        adminName: user?.name || 'Admin',
        adminEmail: user?.email || '',
        createdAt: now,
      }

      setMessages((prev) =>
        prev.map((m) =>
          m._id === selectedMessage._id
            ? { ...m, status: 'replied', isRead: true, replies: [...(m.replies || []), newReply] }
            : m
        )
      )
      setSelectedMessage((prev) => ({
        ...prev,
        status: 'replied',
        isRead: true,
        replies: [...(prev.replies || []), newReply],
      }))
      setReplyText('')
    } catch (err) {
      console.error('Error replying:', err)
    } finally {
      setReplying(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      setDeleting(true)
      await apiFetch(`/api/admin/messages/${id}`, { method: 'DELETE' })
      setMessages((prev) => prev.filter((m) => m._id !== id))
      setDeleteConfirm(null)
      if (selectedMessage?._id === id) setSelectedMessage(null)
    } catch (err) {
      console.error('Error deleting:', err)
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return '-'
    }
  }

  const formatShortDate = (date) => {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return '-'
    }
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            <p className="text-sm text-gray-500">
              {pagination.total} total messages
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700">
                  {unreadCount} unread
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none w-52"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none"
            >
              <option value="">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 flex-1">{error}</p>
            <button onClick={() => fetchMessages(1)} className="text-sm text-red-700 font-medium hover:underline">
              Retry
            </button>
          </div>
        )}

        {/* Messages List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="divide-y divide-gray-50">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-5 py-4 flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-1/3" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-1/4" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="py-16 text-center">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-400">
                {error ? 'Unable to load messages' : 'No messages found'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`px-5 py-4 flex items-start gap-3 cursor-pointer hover:bg-gray-50/50 transition-colors ${
                    !msg.isRead ? 'bg-blue-50/30' : ''
                  }`}
                  onClick={() => openMessage(msg)}
                >
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                      !msg.isRead ? 'bg-olive' : 'bg-gray-400'
                    }`}
                  >
                    {msg.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={`text-sm truncate ${!msg.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {msg.name}
                      </p>
                      {!msg.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate mb-0.5">{msg.email}</p>
                    <p className={`text-sm truncate ${!msg.isRead ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                      {msg.subject}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5 max-w-md">
                      {msg.message}
                    </p>
                  </div>

                  {/* Right side */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <p className="text-[11px] text-gray-400">{formatShortDate(msg.createdAt)}</p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        STATUS_BADGE[msg.status] || STATUS_BADGE.unread
                      }`}
                    >
                      {STATUS_LABEL[msg.status] || 'Unread'}
                    </span>
                    <div className="flex gap-1 mt-0.5">
                      {msg.status === 'replied' && (
                        <Reply className="w-3.5 h-3.5 text-green-500" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteConfirm(msg._id)
                        }}
                        className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                        title="Delete message"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Page {pagination.page} of {pagination.pages}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => fetchMessages(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => fetchMessages(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Message Detail Modal ── */}
      {selectedMessage && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h3 className="font-bold text-gray-900">Message</h3>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Sender info */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-olive to-olive-dark flex items-center justify-center text-white font-bold">
                  {selectedMessage.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{selectedMessage.name}</p>
                  <p className="text-xs text-gray-500">{selectedMessage.email}</p>
                </div>
              </div>

              {/* Date & Contact */}
              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(selectedMessage.createdAt)}
                </span>
                {selectedMessage.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {selectedMessage.phone}
                  </span>
                )}
              </div>

              {/* Subject */}
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1">Subject</p>
                <p className="text-sm font-semibold text-gray-800">{selectedMessage.subject}</p>
              </div>

              {/* Original Message */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-[11px] font-semibold text-gray-400 uppercase mb-2">Message</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </p>
              </div>

              {/* Conversation History */}
              {selectedMessage.replies?.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase mb-2">
                    Conversation ({selectedMessage.replies.length} {selectedMessage.replies.length === 1 ? 'reply' : 'replies'})
                  </p>
                  <div className="space-y-2.5">
                    {selectedMessage.replies.map((reply, i) => (
                      <div
                        key={reply._id || i}
                        className="bg-green-50 border border-green-100 rounded-xl p-3.5"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                              <User className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-xs font-semibold text-green-800">
                              {reply.adminName || 'Admin'}
                            </span>
                          </div>
                          <span className="text-[10px] text-green-600">
                            {formatDate(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {reply.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply Section */}
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase mb-2">Reply</p>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply..."
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none"
                />
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim() || replying}
                  className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: replyText.trim() && !replying ? '#C9A961' : '#e5e7eb',
                    color: replyText.trim() && !replying ? '#fff' : '#9ca3af',
                  }}
                >
                  {replying ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send Reply
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-gray-900 mb-2">Delete Message</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this message? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
