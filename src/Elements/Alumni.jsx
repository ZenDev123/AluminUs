
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import './CSS.css';

const Alumni = ({ user, adminEmails }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [course, setCourse] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [links, setLinks] = useState([]);
  const [alumni, setAlumni] = useState([]);

  const isAdmin = user?.email && adminEmails.includes(user.email.toLowerCase());

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    const querySnapshot = await getDocs(collection(db, 'alumni'));
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setAlumni(data);
  };

  const openAlumniModal = (alum) => {
  setSelectedAlumni(alum);
  setName(alum.name);
  setContact(alum.contact);
  setGraduationYear(new Date(alum.graduationYear.seconds * 1000).toISOString().split("T")[0]);
  setCourse(alum.course);
  setLinks(alum.links || []);
  setShowModal(true);
  setIsEditing(false);
};


  const handleAddLink = (e) => {
    e.preventDefault();
    if (linkTitle.trim() && linkUrl.trim()) {
      setLinks(prev => [...prev, { title: linkTitle, url: linkUrl }]);
      setLinkTitle('');
      setLinkUrl('');
    }
  };

  const handleRemoveLink = (index) => {
    setLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !contact || !graduationYear || !course) return;

    try {
      if (selectedAlumni) {
        const ref = doc(db, 'alumni', selectedAlumni.id);
        await updateDoc(ref, {
          name,
          contact,
          graduationYear: new Date(graduationYear),
          course,
          links
        });
      } else {
        await addDoc(collection(db, 'alumni'), {
          name,
          contact,
          graduationYear: new Date(graduationYear),
          course,
          links
        });
      }
      setShowModal(false);
      fetchAlumni();
      resetForm();
    } catch (err) {
      console.error('Error saving alumni:', err);
    }
  };

  const resetForm = () => {
    setName('');
    setContact('');
    setGraduationYear('');
    setCourse('');
    setLinks([]);
    setLinkTitle('');
    setLinkUrl('');
    setSelectedAlumni(null);
    setIsEditing(false);
  };

  const handleDelete = async (e) => {
  e.preventDefault();
  if (!selectedAlumni || !selectedAlumni.id) return; // Prevent error

  try {
    await deleteDoc(doc(db, 'alumni', selectedAlumni.id));
    setAlumni(prev => prev.filter(a => a.id !== selectedAlumni.id));
    setShowModal(false);
    setSelectedAlumni(null);
  } catch (err) {
    console.error('Delete failed:', err);
  }
};


  return (
    <div className="alumni-page">
      <div className="titles">
        <h2>Alumni Details</h2>
        {isAdmin && (
        <button onClick={() => {
          resetForm();
          setShowModal(true);
          setIsEditing(true);
        }}>Add Alumni</button>
      )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close_btn" onClick={() => setShowModal(false)}><CloseIcon /></button>
            {!isEditing ? (
              <>
                <h2 className='title' style={{textTransform:"capitalize"}}>{name}</h2>
                <p style={{marginTop:"20px", marginLeft:"20px"}}><strong>Contact:</strong> {contact}</p>
                <p style={{marginTop:"20px", marginLeft:"20px"}}><strong>Graduated:</strong> {graduationYear}</p>
                <p style={{marginTop:"20px", marginLeft:"20px"}}><strong>Course:</strong> {course}</p>
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
                      <button onClick={(e) => handleDelete(e, selectedAlumni.id)} className='delete_btn'><DeleteIcon /></button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className='Title' />
                <input type="tel" placeholder="Contact Number" value={contact} pattern="[0-9]{10}" maxLength={10} onChange={(e) => setContact(e.target.value)} className='Title' />
                <input type="date" value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} className='from_date' />
                <input type="text" placeholder="Course Pursued" value={course} onChange={(e) => setCourse(e.target.value)} className='Title' />
                <div className="link-inputs">
                  <input type="text" placeholder="Link Title" value={linkTitle} maxLength={10} onChange={(e) => setLinkTitle(e.target.value)} className='link_title' />
                  <input type="url" placeholder="Link URL" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className='link_url' />
                  <button className='edit_btn' onClick={handleAddLink}><AddIcon /></button>
                </div>
                <div className="links-preview">
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
                  <button className='update_save_btn' type="submit">{selectedAlumni ? 'Update' : 'Save'} Alumni</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="comp_cards">
        {alumni.map((a, i) => (
          <div className="comp_card slide-up" style={{ animationDelay: `${i * 0.2}s` }} key={i} onClick={() => openAlumniModal(a)}>
          <div className="card_incard" style={{marginBottom: "20px"}}>
            <div className="top_grid">
                <h3 style={{textTransform:"capitalize"}}>{a.name}</h3>
                <button onClick={() => openAlumniModal(a)} className='delete_btn'><DeleteIcon /></button>
            </div>
            <p style={{margin:"5px"}}><strong>Contact:</strong> {a.contact}</p>
            <p style={{margin:"5px"}}><strong>Graduated:</strong> {a.graduationYear?.seconds ? new Date(a.graduationYear.seconds * 1000).toLocaleDateString() : ''}</p>
            <p style={{margin:"5px"}}><strong>Course:</strong> {a.course}</p>
          </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Alumni;
