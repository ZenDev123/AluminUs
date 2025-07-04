import React from 'react'
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';

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
      let comps = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      comps.sort((a, b) => {
        const aDate = a.fromDate?.toDate ? a.fromDate.toDate() : new Date(a.fromDate);
        const bDate = b.fromDate?.toDate ? b.fromDate.toDate() : new Date(b.fromDate);
        return aDate - bDate;
      });

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

const getStatus = (comp) => {
  const now = new Date();
  const from = comp.fromDate?.toDate ? comp.fromDate.toDate() : new Date(comp.fromDate);
  const to = comp.toDate?.toDate ? comp.toDate.toDate() : new Date(comp.toDate);

  if (now >= from && now <= to) return 'current';
  if (from > now) return 'upcoming';
  return 'past';
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
   const handleRemoveLink = (index) => {
    setLinks(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="admin_page">
      <div className="titles">
        <h2>
          Competitions
        </h2>
        {isAdmin && (
          <button onClick={() => {
            clearForm();
            setShowModal(true);
            setSelectedComp(null);
            setIsEditing(true);
          }}>Add Competition</button>
      )}
      </div>
      

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close_btn" onClick={() => setShowModal(false)}><CloseIcon /></button>
            {!isEditing ? (
              <>
                <h2 className='title'>{title}</h2>
                <p className='desc'>{desc}</p>
                <p className='fromDate'>From: {formatDate(selectedComp?.fromDate)}</p>
                <p className='toDate'>To: {formatDate(selectedComp?.toDate)}</p>
                <div className='links'>
                  {links.map((l, i) => (
                    <a href={l.url} key={i} target="_blank" rel="noreferrer" className='link'>{l.title}</a>
                  ))}
                </div>
                  
                {isAdmin && (
                  <div className='Actions_List'>
                  <>&nbsp;</>
                  <div className="actions">
                    <button onClick={() => setIsEditing(true)} className='edit_btn'><EditIcon /></button>
                    &nbsp;
                    <button
                      onClick={(e) => handleDeleteCompetition(e, selectedComp.id)}
                      className='delete_btn'
                    ><DeleteIcon /></button>
                  </div>
                  </div>
                )}
              </>
            ) : (
              <form onSubmit={selectedComp ? handleUpdateCompetition : handleAddCompetition} className='editForm'>
                <input className='Title' type="text" placeholder="Competition Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <textarea className="Desc" placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
                <input className="from_date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                <input className="to_date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                <div className="link-inputs">
                  <input className='link_title' maxLength={10} type="text" placeholder="Link Title" value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} />
                  <input className='link_url' type="url" placeholder="Link URL" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
                  <button className='edit_btn' onClick={handleAddLink}><AddIcon /></button>
                </div>
                <div className="links-preview" style={{marginTop: '10px'}}>
                  <h4>Links added:</h4>
                  <div className='links'>
                    {links.map((l, i) => (
                      <>
                        <a href={l.url} key={i} target="_blank" rel="noreferrer" className='link'>{l.title}</a>
                        <button className='delete_btn' type="button" onClick={() => handleRemoveLink(i)}><DeleteIcon /></button>
                      </>
                    ))}
                  </div>
                </div>
                <div className="actions_btns">
                  <>&nbsp;</>
                  <button className='update_save_btn' type="submit">{selectedComp ? 'Update' : 'Save'} Competition</button>
                </div>
              </form>
            )}
          </div>
          
        </div>
      )}

      <div className="comp_cards">
        {competitions.map((comp, index) => (
          <div
            key={comp.id}
            className={`comp_card slide-up ${getStatus(comp)}`}
            style={{ animationDelay: `${index * 0.2}s` }}
            onClick={() => openCompModal(comp)}
          >
          <div className="card_incard">
            
            <div className="top_grid">
            <h4>{comp.title}</h4>
              {isAdmin && (
              <button
                onClick={(e) => handleDeleteCompetition(e, comp.id)}
                className='delete_btn'
              ><DeleteIcon /></button>
            )}
            </div>
            <p>
              {comp.description.length > 90
                ? `${comp.description.slice(0, 90)}...`
                : comp.description}
            </p>
            <p><strong>Event Date:</strong> {formatDate(comp.fromDate)} - {formatDate(comp.toDate)}</p>
            {/* <p><strong>To:</strong> p> */}
            
            
          </div>
          <div className="status">
            {getStatus(comp) === "current" ? "Ongoing" : getStatus(comp) === "upcoming" ? "Yet to Happen" : "Past"}
          </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Competitions
