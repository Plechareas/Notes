// src/components/NoteEditor.jsx
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function NoteEditor({
  title,
  setTitle,
  note,
  setNote,
  insertMarkdown,
  textareaRef,
  tagInput,
  setTagInput,
  tagColor,
  setTagColor,
  filteredTags,
  selectedTag,
  setSelectedTag,
  tagOptions,
  setTagOptions,
  onAddNote,
  audioBlob,
  setAudioBlob,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const handleAudioRecord = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks = [];

        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          setAudioBlob(blob);
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
      } catch (err) {
        alert('Microphone access denied.');
        console.error(err);
      }
    } else {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="input-form">
      <input
        type="text"
        placeholder="Note title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div
        className="markdown-toolbar"
        style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}
      >
        <button onClick={() => insertMarkdown('bold')}><b>B</b></button>
        <button onClick={() => insertMarkdown('italic')}><i>I</i></button>
        <button onClick={() => insertMarkdown('link')}>🔗</button>
        <button onClick={() => insertMarkdown('code')}>🖥️</button>
        <button onClick={() => insertMarkdown('quote')}>❝</button>
        <button onClick={() => insertMarkdown('ul')}>• List</button>
      </div>

      <textarea
        ref={textareaRef}
        placeholder="Your note..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <div className="live-preview">
        <h5 style={{ margin: '10px 0 4px' }}>Live Preview:</h5>
        <div className="note-content-preview">
          <ReactMarkdown>{note}</ReactMarkdown>
        </div>
      </div>

      <input
        type="text"
        placeholder="Type to filter or create tag..."
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
      />

      <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
        <span style={{ fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          🎨 Pick tag color
        </span>
        <input
          type="color"
          value={tagColor}
          onChange={(e) => setTagColor(e.target.value)}
          style={{ width: '40px', height: '30px', border: 'none', cursor: 'pointer' }}
        />
      </label>

      <select
        value={selectedTag.label}
        onChange={(e) =>
          setSelectedTag(tagOptions.find(tag => tag.label === e.target.value))
        }
      >
        {filteredTags.map((tag, index) => (
          <option key={index} value={tag.label}>
            {tag.label}
          </option>
        ))}
      </select>

          <button
      onClick={handleAudioRecord}
      style={{
        margin: '10px 0',
        padding: '4px',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: isRecording ? '#ea4335' : '#f1f3f4',
        color: isRecording ? '#fff' : '#333',
        border: '1px solid #ccc',
        fontSize: '16px',
        lineHeight: 1,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
      }}
      title={isRecording ? 'Stop Recording' : 'Start Recording'}
    >
      {isRecording ? '🛑' : '🎤'}
    </button>



      {audioBlob && (
        <audio controls style={{ marginBottom: '10px' }}>
          <source src={URL.createObjectURL(audioBlob)} type="audio/webm" />
          Your browser does not support the audio element.
        </audio>
      )}

      <button onClick={onAddNote}>➕ Add Note</button>
    </div>
  );
}
