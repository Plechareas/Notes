import { useEffect, useState, useRef } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import NoteCard from './components/NoteCard';
import NoteEditor from './components/NoteEditor';
import CalendarView from './components/CalendarView';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [notes, setNotes] = useState([]);
  const [tagOptions, setTagOptions] = useState([
    { label: 'Work', color: '#34a853' },
    { label: 'Personal', color: '#4285f4' },
    { label: 'Urgent', color: '#ea4335' },
    { label: 'Other', color: '#9e9e9e' },
  ]);
  const [filteredTags, setFilteredTags] = useState(tagOptions);
  const [tagInput, setTagInput] = useState('');
  const [tagColor, setTagColor] = useState('#888888');
  const [selectedTag, setSelectedTag] = useState(tagOptions[0]);
  const [darkMode, setDarkMode] = useState(false);
  const [search, setSearch] = useState('');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const textareaRef = useRef();

  useEffect(() => {
    const stored = localStorage.getItem('anastasia-notes');
    if (stored) {
      setNotes(JSON.parse(stored));
    }
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('anastasia-notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    setFilteredTags(
      tagOptions.filter(tag =>
        tag.label.toLowerCase().includes(tagInput.toLowerCase())
      )
    );

    const exactMatch = tagOptions.find(tag => tag.label.toLowerCase() === tagInput.toLowerCase());
    if (!exactMatch && tagInput.trim()) {
      setSelectedTag({ label: tagInput.trim(), color: tagColor });
    } else if (exactMatch) {
      setSelectedTag(exactMatch);
    }
  }, [tagInput, tagOptions, tagColor]);

  const addNote = () => {
    if (title.trim() === '' || note.trim() === '') return;

    const now = new Date().toISOString();
    const newNote = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title,
      content: note,
      tag: selectedTag,
      pinned: false,
      audio: audioBlob,
      createdAt: now,
      updatedAt: null,
    };
    setNotes([newNote, ...notes]);

    if (!tagOptions.find(tag => tag.label === selectedTag.label)) {
      setTagOptions([...tagOptions, selectedTag]);
    }

    setTitle('');
    setNote('');
    setAudioBlob(null);
    setSelectedTag(tagOptions[0]);
    setTagInput('');
    setTagColor('#888888');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const deleteNote = (id) => {
    const noteToDelete = notes.find(n => n.id === id);
    const remainingNotes = notes.filter(n => n.id !== id);
    setNotes(remainingNotes);

    const isTagStillUsed = remainingNotes.some(n => n.tag.label === noteToDelete.tag.label);
    if (!isTagStillUsed) {
      setTagOptions(prev => prev.filter(t => t.label !== noteToDelete.tag.label));
    }
  };

  const updateNote = (id, updatedNote) => {
    const updatedNotes = notes.map(n =>
      n.id === id
        ? { ...updatedNote, createdAt: n.createdAt, updatedAt: new Date().toISOString() }
        : n
    );
    setNotes(updatedNotes);
  };

  const togglePin = (id) => {
    const updatedNotes = notes.map(n =>
      n.id === id ? { ...n, pinned: !n.pinned } : n
    );
    setNotes(updatedNotes);
  };

  const handleCalendarDateClick = (date) => {
    const formatted = date.toISOString().split('T')[0]; // yyyy-mm-dd
    setSelectedDate(formatted);
  };

  const filteredGroupedNotes = tagOptions.map((tag) => {
    const taggedNotes = notes.filter((n) => {
      const matchesSearch =
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase());

      const matchesDate =
        !selectedDate || n.createdAt.startsWith(selectedDate);

      return n.tag.label === tag.label && matchesSearch && matchesDate;
    });

    return taggedNotes.length > 0
      ? {
          tag,
          pinned: taggedNotes.filter(n => n.pinned),
          others: taggedNotes.filter(n => !n.pinned),
        }
      : null;
  }).filter(Boolean);

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
      {showToast && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#04AA6D',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '5px',
            boxShadow: '0 4px 6px rgb(245, 245, 245)',
            zIndex: 1000,
          }}
        >
          ✅ Note added!
        </div>
      )}

      <div className="top-bar">
        <h1>📝 Notes</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <SearchBar search={search} setSearch={setSearch} />
          <button onClick={() => setShowCalendar(prev => !prev)}>
            📅 Calendar
          </button>
          <button onClick={() => setDarkMode(prev => !prev)}>
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </div>

      {showCalendar && (
  <div style={{ margin: '20px 0' }}>
    <CalendarView
      notes={notes}
      onDateClick={(date) => {
        const dateStr = date.toLocaleDateString();
        const found = notes.filter(
          n => new Date(n.createdAt).toLocaleDateString() === dateStr
        );
        if (found.length === 0) {
          alert(`No notes found on ${dateStr}`);
        } else {
          alert(`Notes on ${dateStr}:\n${found.map(n => `• ${n.title}`).join('\n')}`);
        }
      }}
    />
  </div>
)}


      <div className="layout">
        <div className="left-panel">
          <NoteEditor
            title={title}
            setTitle={setTitle}
            note={note}
            setNote={setNote}
            tagInput={tagInput}
            setTagInput={setTagInput}
            tagColor={tagColor}
            setTagColor={setTagColor}
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
            tagOptions={tagOptions}
            setTagOptions={setTagOptions}
            filteredTags={filteredTags}
            setFilteredTags={setFilteredTags}
            onAddNote={addNote}
            textareaRef={textareaRef}
            audioBlob={audioBlob}
            setAudioBlob={setAudioBlob}
          />
        </div>

        <div className="right-panel">
          {filteredGroupedNotes.length === 0 ? (
            <p
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                fontSize: '18px',
                color: '#888',
              }}
            >
              Empty...
            </p>
          ) : (
            filteredGroupedNotes.map(({ tag, pinned, others }) => (
              <div key={tag.label}>
                <h2 className="group-title">
                  <span className="tag" style={{ backgroundColor: tag.color }}>
                    {tag.label}
                  </span>
                </h2>

                {pinned.length > 0 && <h4>Pinned</h4>}
                <AnimatePresence>
                  {pinned.map((n) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <NoteCard
                        note={n}
                        onDelete={() => deleteNote(n.id)}
                        onUpdate={(updatedNote) => updateNote(n.id, updatedNote)}
                        onPinToggle={() => togglePin(n.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {others.length > 0 && <h4>Others</h4>}
                <AnimatePresence>
                  {others.map((n) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <NoteCard
                        note={n}
                        onDelete={() => deleteNote(n.id)}
                        onUpdate={(updatedNote) => updateNote(n.id, updatedNote)}
                        onPinToggle={() => togglePin(n.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
