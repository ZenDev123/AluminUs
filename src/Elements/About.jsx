import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { uploadImage } from '../cloudinaryUpload';
import { deleteDoc, doc } from 'firebase/firestore';
import './CSS.css'


const About = ({ user, adminEmails }) => {
  const [cards, setCards] = useState([]);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const isAdmin = user?.email && adminEmails.some(email => email.toLowerCase() === user.email.toLowerCase());

  useEffect(() => {
    const fetchCards = async () => {
      const querySnapshot = await getDocs(collection(db, 'aboutCards'));
      const fetched = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setCards(fetched);
    };
    fetchCards();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !bio || !image) return;

    // 🧠 Aspect ratio check
    const img = new Image();
    const objectUrl = URL.createObjectURL(image);

    img.onload = async () => {
      const aspectRatio = img.width / img.height;

      if (aspectRatio !== 1) {
        alert("Only square images allowed (1:1 aspect ratio)");
        URL.revokeObjectURL(objectUrl);
        return;
      }

      try {
        setUploading(true);
        const imageUrl = await uploadImage(image);
        await addDoc(collection(db, 'aboutCards'), { name, bio, imageUrl });

        setName('');
        setBio('');
        setImage(null);
        setUploading(false);

        const querySnapshot = await getDocs(collection(db, 'aboutCards'));
        const updatedCards = querySnapshot.docs.map(doc => doc.data());
        setCards(updatedCards);
      } catch (err) {
        console.error('Upload failed:', err);
        setUploading(false);
      }

      URL.revokeObjectURL(objectUrl);
    };

    img.onerror = () => {
      alert("Failed to load image.");
      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  };


    console.log("Class", uploading);

  return (
    <div>
      <div className="titles">
        <h2>
          About Us
        </h2>
      </div>
      {isAdmin && (
        <form onSubmit={handleSubmit} className="about-form">
          <input
            type="text"
            placeholder="Name"
            value={name}
            className='Title'
            maxLength={30}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            placeholder="Short paragraph"
            value={bio}
            className='Desc'
            maxLength={180}
            onChange={(e) => setBio(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className='Files'
            onChange={(e) => setImage(e.target.files[0])}
          />
          <div className="actions_btns">
            <>&nbsp;</>
            <button type="submit" disabled={uploading} className='update_save_btn'>
            {uploading ? 'Uploading...' : 'Add Card'}
          </button>
          </div>
          
        </form>
      )}

      <div className="about-cards">
        {cards.map((card, idx) => (
          <div
            className="about-card"
            key={idx}
            style={{ animationDelay: `${idx * 0.2}s` }}
          >
            <img className='person_image' src={card.imageUrl} alt={card.name} />
            <h3 className='person_name'>{card.name}</h3>
            <p className='person_bio'>{card.bio}</p>
        
            {isAdmin && (
              <button
                onClick={async () => {
                  try {
                    const ref = doc(db, 'aboutCards', card.id);
                    await deleteDoc(ref);
                    setCards(prev => prev.filter(c => c.id !== card.id));
                  } catch (err) {
                    console.error('Delete failed:', err);
                  }
                }}
                className='delete_btn'
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

    </div>
    
  )
}

export default About
