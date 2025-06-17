import React from 'react'
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const Competitions = ({user, adminEmails}) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [links, setLinks] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedComp, setSelectedComp] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const isAdmin = user?.email && adminEmails.some(email => email.toLowerCase() === user.email.toLowerCase());

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'competitions'));
      const comps = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCompetitions(comps);
    } catch (err) {
      console.error('Error fetching competitions:', err);
    }
  };

  const handleAddLink = (e) => {
    e.preventDefault();
    if (linkTitle.trim() && linkUrl.trim()) {
      setLinks(prev => [...prev, { title: linkTitle.trim(), url: linkUrl.trim() }]);
      setLinkTitle('');
      setLinkUrl('');
    }
  };

  const handleRemoveLink = (index) => {
    setLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddCompetition = async (e) => {
    e.preventDefault();
    const compData = {
      title,
      description: desc,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      links
    };
    try {
      await addDoc(collection(db, 'competitions'), compData);
      console.log('Competition added successfully!');
      fetchCompetitions();
      clearForm();
      setShowModal(false);
    } catch (err) {
      console.error('Error adding competition:', err);
    }
  };

  const handleUpdateCompetition = async (e) => {
    e.preventDefault();
    if (!selectedComp) return;
    try {
      const compRef = doc(db, 'competitions', selectedComp.id);
      await updateDoc(compRef, {
        title,
        description: desc,
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        links
      });
      console.log('Competition updated!');
      fetchCompetitions();
      setIsEditing(false);
      setShowModal(false);
    } catch (err) {
      console.error('Error updating competition:', err);
    }
  };

  const handleDeleteCompetition = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'competitions', id));
      console.log('Competition deleted!');
      fetchCompetitions();
      setShowModal(false);
    } catch (err) {
      console.error('Error deleting competition:', err);
    }
  };

  const clearForm = () => {
    setTitle('');
    setDesc('');
    setFromDate('');
    setToDate('');
    setLinks([]);
    setLinkTitle('');
    setLinkUrl('');
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const openCompModal = (comp) => {
    setSelectedComp(comp);
    setTitle(comp.title);
    setDesc(comp.description);
    setFromDate(comp.fromDate?.toDate ? comp.fromDate.toDate().toISOString().split("T")[0] : '');
    setToDate(comp.toDate?.toDate ? comp.toDate.toDate().toISOString().split("T")[0] : '');
    setLinks(comp.links || []);
    setShowModal(true);
    setIsEditing(false);
  };

  return (
    <div className="admin_page">
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowModal(false)}>X</button>

            {!isEditing ? (
              <>
                <h2>{title}</h2>
                <p>{desc}</p>
                <p>From: {formatDate(selectedComp?.fromDate)}</p>
                <p>To: {formatDate(selectedComp?.toDate)}</p>
                <ul>
                  {links.map((l, i) => (
                    <li key={i}>
                      {l.title} - <a href={l.url} target="_blank" rel="noreferrer">{l.url}</a>
                    </li>
                  ))}
                </ul>
                {isAdmin && (
                  <>
                    <button onClick={() => setIsEditing(true)}>Edit</button>
                    <button
                      style={{ backgroundColor: 'red', color: 'white' }}
                      onClick={(e) => handleDeleteCompetition(e, selectedComp.id)}
                    >Delete</button>
                  </>
                )}
              </>
            ) : (
              <form onSubmit={selectedComp ? handleUpdateCompetition : handleAddCompetition}>
                <input
                  type="text"
                  placeholder="Competition Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                  placeholder="Description"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
                <div className="link-inputs">
                  <input
                    type="text"
                    placeholder="Link Title"
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                  />
                  <input
                    type="url"
                    placeholder="Link URL"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                  />
                  <button onClick={handleAddLink}>Add Link</button>
                </div>
                <div className="links-preview">
                  <h4>Links added:</h4>
                  {links.map((l, i) => (
                    <div key={i}>
                      {l.title} - <a href={l.url} target="_blank" rel="noreferrer">{l.url}</a>
                      <button type="button" onClick={() => handleRemoveLink(i)}>Remove</button>
                    </div>
                  ))}
                </div>
                <button type="submit">{selectedComp ? 'Update' : 'Save'} Competition</button>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="competition-list">
        <h3>Competitions in DB:</h3>
        {competitions.map((comp) => (
          <div key={comp.id} className="comp-card" onClick={() => openCompModal(comp)}>
            <h4>{comp.title}</h4>
            <p>{comp.description}</p>
            <p><strong>From:</strong> {formatDate(comp.fromDate)}</p>
            <p><strong>To:</strong> {formatDate(comp.toDate)}</p>
            {isAdmin && (
              <button
                style={{ backgroundColor: 'red', color: 'white' }}
                onClick={(e) => handleDeleteCompetition(e, comp.id)}
              >Delete</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Competitions
