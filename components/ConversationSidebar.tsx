'use client'

import { useState } from 'react'
import { MessageSquare, Plus, Trash2, X } from 'lucide-react'
import DeleteModal from './DeleteModal'
import { Conversation } from '@/hooks/useConversations'
import { conversationsApi } from '@/lib/api'

interface ConversationSidebarProps {
  currentConversationId?: string
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  isOpen: boolean
  onClose: () => void
  conversations: Conversation[]
  isLoading: boolean
  onRemoveConversation: (id: string) => void
}

export default function ConversationSidebar({
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  isOpen,
  onClose,
  conversations,
  isLoading,
  onRemoveConversation,
}: ConversationSidebarProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = (conversation: Conversation, e: React.MouseEvent) => {
    e.stopPropagation()
    setConversationToDelete(conversation)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!conversationToDelete) return

    setIsDeleting(true)
    try {
      await conversationsApi.delete(conversationToDelete.id)
      // Optimistically remove from list
      onRemoveConversation(conversationToDelete.id)
      if (currentConversationId === conversationToDelete.id) {
        onNewConversation()
      }
      setDeleteModalOpen(false)
      setConversationToDelete(null)
    } catch (error) {
      console.error('Error deleting conversation:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false)
    setConversationToDelete(null)
  }

  const handleNewConversation = () => {
    onNewConversation()
  }

  const getConversationTitle = (conversation: Conversation): string => {
    if (conversation.title) return conversation.title
    if (conversation.messages && conversation.messages.length > 0) {
      const firstMessage = conversation.messages[0]
      return firstMessage.content.substring(0, 50) + (firstMessage.content.length > 50 ? '...' : '')
    }
    return 'New Conversation'
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Conversations
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewConversation}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="New Conversation"
            >
              <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors lg:hidden"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Loading...
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No conversations yet. Start chatting!
            </div>
          ) : (
            <div className="p-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => {
                    onSelectConversation(conversation.id)
                    onClose()
                  }}
                  className={`group relative p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                    currentConversationId === conversation.id
                      ? 'bg-slate-100 dark:bg-gray-700 dark:hover:bg-gray-600'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {getConversationTitle(conversation)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(conversation.updatedAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteClick(conversation, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-all"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={conversationToDelete ? getConversationTitle(conversationToDelete) : ''}
        isLoading={isDeleting}
      />
    </>
  )
}

