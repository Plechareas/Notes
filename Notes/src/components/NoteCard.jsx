import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import './NoteCard.css';

function NoteCard({ note, onDelete, onUpdate, searchTerm = '' }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(note.title);
  const [editedContent, setEditedContent] = useState(note.content);
  const [showDetails, setShowDetails] = useState(false);

  const handleSave = () => {
    onUpdate({
      ...note,
      title: editedTitle,
      content: editedContent,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(note.title);
    setEditedContent(note.content);
    setIsEditing(false);
  };

  const handleToggleDetails = () => {
    if (!isEditing) {
      setShowDetails((prev) => !prev);
    }
  };

  const insertMarkdown = (syntax) => {
    const textarea = document.querySelector('.note-content-input');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editedContent.slice(start, end);
    const before = editedContent.slice(0, start);
    const after = editedContent.slice(end);

    let newText = '';

    if (!selectedText) {
      switch (syntax) {
        case 'bold':
          newText = `****`;
          break;
        case 'italic':
          newText = `**`;
          break;
        case 'link':
          newText = `[](https://)`;
          break;
        case 'code':
          newText = '`code`';
          break;
        case 'quote':
          newText = '> ';
          break;
        case 'ul':
          newText = '- ';
          break;
        default:
          return;
      }

      const result = before + newText + after;
      setEditedContent(result);

      setTimeout(() => {
        textarea.focus();
        const cursor = syntax === 'bold' ? start + 2 : start + newText.length;
        textarea.setSelectionRange(cursor, cursor);
      }, 0);
      return;
    }

    switch (syntax) {
      case 'bold':
        newText = `**${selectedText}**`;
        break;
      case 'italic':
        newText = `*${selectedText}*`;
        break;
      case 'link':
        newText = `[${selectedText}](https://)`;
        break;
      case 'code':
        newText = `\`${selectedText}\``;
        break;
      case 'quote':
        newText = `> ${selectedText}`;
        break;
      case 'ul':
        newText = `- ${selectedText}`;
        break;
      default:
        return;
    }

    const result = before + newText + after;
    setEditedContent(result);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + newText.length);
    }, 0);
  };

  const highlightText = (text) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i}>{part}</mark> : part
    );
  };

  return (
    <motion.div
      className="note-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      onClick={handleToggleDetails}
    >
      <div className="note-header">
        {isEditing ? (
          <input
            className="note-title-input"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
          />
        ) : (
          <h3>{highlightText(note.title)}</h3>
        )}
        <span className="note-tag" style={{ backgroundColor: note.tag.color }}>
          {note.tag.label}
        </span>
      </div>

      {isEditing ? (
        <>
          <div className="markdown-toolbar" style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
            <button onClick={() => insertMarkdown('bold')}><b>B</b></button>
            <button onClick={() => insertMarkdown('italic')}><i>I</i></button>
            <button onClick={() => insertMarkdown('link')}>🔗</button>
            <button onClick={() => insertMarkdown('code')}>🖥️</button>
            <button onClick={() => insertMarkdown('quote')}>❝</button>
            <button onClick={() => insertMarkdown('ul')}>• List</button>
          </div>
          <textarea
            className="note-content-input"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
          />
          <div className="live-preview">
            <h5 style={{ margin: '10px 0 4px' }}>Live Preview:</h5>
            <div className="note-content-preview">
              <ReactMarkdown>{editedContent}</ReactMarkdown>
            </div>
          </div>
        </>
      ) : (
        <div className="note-content">
          <ReactMarkdown>
            {note.content.length > 100 && !showDetails
              ? note.content.slice(0, 100) + '...'
              : note.content}
          </ReactMarkdown>
        </div>
      )}

      {!isEditing && showDetails && (
        <div className="note-timestamps">
          {note.createdAt && (
            <p className="timestamp">🕒 Created: {new Date(note.createdAt).toLocaleString()}</p>
          )}
          {note.updatedAt && (
            <p className="timestamp">✏️ Updated: {new Date(note.updatedAt).toLocaleString()}</p>
          )}
        </div>
      )}

      <div className="note-actions">
        {isEditing ? (
          <>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave}>💾 Save</motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleCancel}>❌ Cancel</motion.button>
          </>
        ) : (
          <>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsEditing(true)}>✏️ Edit</motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={onDelete}>🗑️ Delete</motion.button>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default NoteCard;
