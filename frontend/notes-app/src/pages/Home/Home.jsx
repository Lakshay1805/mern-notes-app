import React, { useEffect } from 'react'
import { useState } from 'react'
import NoteCard from '../../components/NoteCard.jsx'
import Navbar from '../../components/Navbar.jsx'
import { MdAdd } from 'react-icons/md'
import AddEditNotes from './AddEditNotes.jsx'
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance.js'
import Toast from '../../components/Toast.jsx'
import EmptyCard from '../../components/EmptyCard.jsx'

const Home = () => {

  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  })
  const [isSearch, setIsSearch] = useState(false)
  const [showToastMsg, setShowToastMsg] = useState({
    isShown: false,
    type: "add",
    message: ""
  })
  const [userInfo, setUserInfo] = useState(null)
  const [notes, setNotes] = useState([])
  const navigate = useNavigate();

  const showToastMessage = (message, type) => {
    setShowToastMsg({
      isShown: true,
      message,
      type
    })
  }
  const handleToastClose = () => {
    setShowToastMsg({ isShown: false, message: "" })
  }
  const handleEdit = async (noteData) => {
    setOpenAddEditModal({ isShown: true, type: "edit", data: noteData })
  }

  //get user info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/user")
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response.status === 400) {
        localStorage.clear();
        navigate("/login");
      }
    }
  }
  //get all notes
  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("/notes");
      if (response.data && response.data.notes) {
        setNotes(response.data.notes)
      }
    } catch (error) {
      if (error) {
        console.log("An error occurred")
      }
    }
  }
  //delete note api
  const deleteNote = async (data) => {
    try {
      const noteId = data._id;
      const response = await axiosInstance.delete("/delete/" + noteId)
      if (response.data && !response.data.error) {
        showToastMessage("Note Deleted Successfully", "delete")
        getAllNotes();
        onClose();
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        console.log("Some error occured")
      }
    }
  }
  //pin note api
  const updatepinNote = async (data) => {
    try {
      const noteId = data._id;

      const response = await axiosInstance.put("/updateIsPin/" + noteId, {
        isPinned: !data.isPinned
      });

      if (response.data && response.data.note) {
        showToastMessage("Pin updated");

        // update UI instantly
        data.isPinned = !data.isPinned;

        getAllNotes();
      }

    } catch (error) {
      console.log("Some error occurred");
    }
  }
  //search api
  const onSearchNote = async (searchQuery) => {
    try {
      const response = await axiosInstance.get("/searchNotes", {
        params: {
          query: searchQuery
        }
      });

      if (response.data && response.data.notes) {
        setNotes(response.data.notes);
        setIsSearch(true)
      }

    } catch (error) {
      console.log("Search error", error);
    }
  };
  //clear search api
  const handleClearSearch = () => {
    setIsSearch(false)
    getAllNotes()
  }
  //home page ui api
  useEffect(() => {
    getAllNotes();
    getUserInfo();

    return () => {
    }
  }, [])


  return (<>
    <Navbar userInfo={userInfo} onSearchNote={onSearchNote} handleClearSearch={handleClearSearch} />
    <div className='container mx-auto'>
      {notes.length === 0 ? (
        <EmptyCard message={"Start creating your first note! Click 'Add' button to note down your thoughts, ideas & reminders. Let's get started"} />
      ) : (<div className='grid grid-cols-3 gap-4 mt-8'>
        {notes.map((note, index) => (
          <NoteCard
            key={note._id}
            title={note.title}
            date={note.createdOn}
            content={note.content}
            tags={note.tags}
            isPinned={note.isPinned}
            onEdit={() => handleEdit(note)}
            onDelete={() => deleteNote(note)}
            onPinNote={() => { updatepinNote(note) }} />
        ))}

      </div>)}

    </div>
    <button
      className='w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10'
      onClick={() => { setOpenAddEditModal({ isShown: true, type: 'add', data: null }) }}>
      <MdAdd className='text-white text-[32px]' />
    </button>
    <Modal
      isOpen={openAddEditModal.isShown}
      onRequestClose={() => { }}
      style={{
        overlay: {
          backgroundColor: "rgba(0,0,0,0.2)",
        },
      }}
      contentLabel=''
      className='w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll'>
      <AddEditNotes noteData={openAddEditModal.data} type={openAddEditModal.type}
        showToastMessage={showToastMessage} getAllNotes={getAllNotes} onClose={() => setOpenAddEditModal({ isShown: false, type: "add", data: null })} />
    </Modal>
    <Toast type={showToastMsg.type} isShown={showToastMsg.isShown} message={showToastMsg.message} onClose={handleToastClose} />
  </>)
}

export default Home