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
import SkeletonCard from '../../components/SkeletonCard.jsx'

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
  const [filterStatus, setFilterStatus] = useState('active')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [isLoading, setIsLoading] = useState(false)
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
      if (error.response?.status === 400 || error.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  }
  //get all notes
  const getAllNotes = async () => {
    setIsLoading(true);
    try {
      let params = new URLSearchParams();
      if (filterStatus === 'archived') params.append('isArchived', 'true');
      else if (filterStatus === 'trashed') params.append('isTrashed', 'true');
      
      if (searchQuery) params.append('search', searchQuery);
      if (sortBy) {
        if (sortBy === 'created_asc') { params.append('sortBy', 'createdOn'); params.append('sortOrder', 'asc'); }
        if (sortBy === 'created_desc') { params.append('sortBy', 'createdOn'); params.append('sortOrder', 'desc'); }
        if (sortBy === 'title_asc') { params.append('sortBy', 'title'); params.append('sortOrder', 'asc'); }
      }

      const response = await axiosInstance.get(`/notes?${params.toString()}`);
      if (response.data && response.data.notes) {
        setNotes(response.data.notes)
      }
    } catch (error) {
      console.log("An error occurred")
    } finally {
      setIsLoading(false);
    }
  }
  const handleTrash = async (data) => {
    try {
      const response = await axiosInstance.put("/edit/" + data._id, {
        isTrashed: true,
        isPinned: false
      });
      if (response.data && !response.data.error) {
        showToastMessage("Moved to Trash", "delete")
        getAllNotes();
      }
    } catch (error) {
      console.log("Some error occurred")
    }
  }
  //delete note api
  const handlePermanentDelete = async (data) => {
    try {
      const noteId = data._id;
      const response = await axiosInstance.delete("/delete/" + noteId)
      if (response.data && !response.data.error) {
        showToastMessage("Note Permanently Deleted", "delete")
        getAllNotes();
      }
    } catch (error) {
      console.log("Some error occurred")
    }
  }
    const handleArchive = async (data) => {
    try {
      const response = await axiosInstance.put("/edit/" + data._id, {
        isArchived: !data.isArchived,
        isPinned: false
      });
      if (response.data && response.data.note) {
        showToastMessage(data.isArchived ? "Note Unarchived" : "Note Archived", "success");
        getAllNotes();
      }
    } catch (error) {
      console.log("Some error occurred");
    }
  }
    const handleRestore = async (data) => {
    try {
      const response = await axiosInstance.put("/edit/" + data._id, {
        isTrashed: false,
        isArchived: false
      });
      if (response.data && response.data.note) {
        showToastMessage("Note Restored", "success");
        getAllNotes();
      }
    } catch (error) {
      console.log("Some error occurred");
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
  const onSearchNote = (query) => {
    setSearchQuery(query);
    setIsSearch(true);
  };
  //clear search api
  const handleClearSearch = () => {
    setIsSearch(false)
    setSearchQuery('')
    getAllNotes()
  }
  //home page ui api
  useEffect(() => {
    getAllNotes();
    getUserInfo();

  }, [filterStatus, searchQuery, sortBy])


  return (<>
    <Navbar userInfo={userInfo} onSearchNote={onSearchNote} handleClearSearch={handleClearSearch} />
    <div className='container mx-auto px-4'>
      <div className='flex items-center justify-between mt-6'>
          <div className='flex items-center gap-4'>
              <button className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterStatus === 'active' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`} onClick={() => setFilterStatus('active')}>Active Notes</button>
              <button className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterStatus === 'archived' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`} onClick={() => setFilterStatus('archived')}>Archived</button>
              <button className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterStatus === 'trashed' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`} onClick={() => setFilterStatus('trashed')}>Trash</button>
          </div>
          <div className="relative group z-10">
            <div className='border border-slate-300 rounded-md px-3 py-2 text-sm outline-none bg-white min-w-[140px] cursor-pointer flex justify-between items-center transition-all'>
              <span className="text-slate-700 font-medium">
                {sortBy === 'created_desc' ? 'Newest First' : sortBy === 'created_asc' ? 'Oldest First' : sortBy === 'title_asc' ? 'Title (A-Z)' : 'Sort By'}
              </span>
              <span className="ml-2 text-slate-500 text-[10px] transition-transform duration-200 group-hover:rotate-180">▼</span>
            </div>
            
            {/* Invisible bridge to keep hover active */}
            <div className="absolute w-full h-3 bg-transparent top-full left-0 z-10"></div>
            
            <div className="absolute right-0 top-[calc(100%+4px)] hidden group-hover:block bg-white border border-slate-200 rounded-md shadow-xl z-20 w-full min-w-[150px] overflow-hidden origin-top-right transition-opacity duration-200">
              <ul className="py-1">
                <li 
                  className={`px-4 py-2 text-sm hover:bg-slate-100 cursor-pointer transition-colors ${sortBy === '' ? 'bg-slate-50 text-slate-900 font-medium' : 'text-slate-700'}`} 
                  onClick={() => setSortBy('')}
                >
                  Default
                </li>
                <li 
                  className={`px-4 py-2 text-sm hover:bg-slate-100 cursor-pointer transition-colors ${sortBy === 'created_desc' ? 'bg-slate-50 text-slate-900 font-medium' : 'text-slate-700'}`} 
                  onClick={() => setSortBy('created_desc')}
                >
                  Newest First
                </li>
                <li 
                  className={`px-4 py-2 text-sm hover:bg-slate-100 cursor-pointer transition-colors ${sortBy === 'created_asc' ? 'bg-slate-50 text-slate-900 font-medium' : 'text-slate-700'}`} 
                  onClick={() => setSortBy('created_asc')}
                >
                  Oldest First
                </li>
                <li 
                  className={`px-4 py-2 text-sm hover:bg-slate-100 cursor-pointer transition-colors ${sortBy === 'title_asc' ? 'bg-slate-50 text-slate-900 font-medium' : 'text-slate-700'}`} 
                  onClick={() => setSortBy('title_asc')}
                >
                  Title (A-Z)
                </li>
              </ul>
            </div>
          </div>
      </div>

      {isLoading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8'>
          {[1,2,3,4,5,6].map((item) => <SkeletonCard key={item} />)}
        </div>
      ) :notes.length === 0 ? (
        <EmptyCard message={"Start creating your first note! Click 'Add' button to note down your thoughts, ideas & reminders. Let's get started"} />
      ) : (<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8'>
        {notes.map((note, index) => (
          <NoteCard
            key={note._id}
            title={note.title}
            date={note.createdOn}
            content={note.content}
            tags={note.tags}
            isPinned={note.isPinned}
            isArchived={note.isArchived}
            isTrashed={note.isTrashed}
            color={note.color}
            attachmentUrl={note.attachmentUrl}
            onEdit={() => handleEdit(note)}
            onDelete={() => handleTrash(note)}
            onPinNote={() => { updatepinNote(note) }}
            onArchive={() => handleArchive(note)}
            onRestore={() => handleRestore(note)}
            onPermanentDelete={() => handlePermanentDelete(note)}
             />
        ))}

      </div>)}

    </div>
    {filterStatus === 'active'&& <button
      className='w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10'
      onClick={() => { setOpenAddEditModal({ isShown: true, type: 'add', data: null }) }}>
      <MdAdd className='text-white text-[32px]' />
    </button>}
    <Modal
      isOpen={openAddEditModal.isShown}
      onRequestClose={() => { }}
      style={{
        overlay: {
          backgroundColor: "rgba(0,0,0,0.2)",
        },
      }}
      contentLabel=''
      className='w-full max-w-2xl bg-white rounded-xl mx-auto mt-14 p-6 shadow-2xl relative outline-none'>
      <AddEditNotes noteData={openAddEditModal.data} type={openAddEditModal.type}
        showToastMessage={showToastMessage} getAllNotes={getAllNotes} onClose={() => setOpenAddEditModal({ isShown: false, type: "add", data: null })} />
    </Modal>
    <Toast type={showToastMsg.type} isShown={showToastMsg.isShown} message={showToastMsg.message} onClose={handleToastClose} />
  </>)
}

export default Home