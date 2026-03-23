import React, { useRef } from 'react'
import TagInput from '../../components/TagInput'
import { useState } from 'react';
import { MdClose } from 'react-icons/md';
import axiosInstance from '../../utils/axiosInstance';

const COLORS = [
    { id: 'white', bg: '#ffffff', label: 'White' },
    { id: 'lightred', bg: '#fee2e2', label: 'Red' },
    { id: 'lightgreen', bg: '#dcfce7', label: 'Green' },
    { id: 'lightblue', bg: '#e0f2fe', label: 'Blue' },
    { id: 'lightyellow', bg: '#fef3c7', label: 'Yellow' }
];

const AddEditNotes = ({ noteData, getAllNotes, type, onClose, showToastMessage }) => {
    const [title, setTitle] = useState(noteData?.title || "");
    const [content, setContent] = useState(noteData?.content || "");
    const [color, setColor] = useState(noteData?.color || "white")
    const [tags, setTags] = useState(noteData?.tags || []);
    const [attachmentUrl, setAttachmentUrl] = useState(noteData?.attachmentUrl || null)
    const [error, setError] = useState(null)
    const [uploading, setUploading] = useState(false);

    const attachmentRef = useRef(noteData?.attachmentUrl || null);
    const handleFileUpload = async (e) => {
        console.log(e.target.files);
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await axiosInstance.post("/upload-attachment", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (response.data && response.data.attachmentUrl) {
                const url = response.data.attachmentUrl;
                setAttachmentUrl(url);
                console.log("url is ", url)
                attachmentRef.current = url;
                showToastMessage("File Uploaded");
            }
        } catch (error) {
            setError("File upload failed");
        } finally {
            setUploading(false);
        }
    }
    //add note
    const addNewNote = async () => {
        try {
            const response = await axiosInstance.post("/create", {
                title: title,
                content: content,
                tags: tags,
                color: color,
                attachmentUrl: attachmentRef.current
            })
            console.log("CREATING NOTE WITH:", attachmentRef.current);
            if (response.data && response.data.note) {
                showToastMessage("Note Added Successfully")
                getAllNotes();
                onClose();
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message)
            }
        }
    }

    //edit note
    const editNote = async () => {
        try {
            const noteId = noteData._id;
            const response = await axiosInstance.put("/edit/" + noteId, {
                title: title,
                content: content,
                tags: tags,
                color: color,
                attachmentUrl: attachmentRef.current
            })
            if (response.data && response.data.note) {
                showToastMessage("Note Updated Successfully")
                getAllNotes();
                onClose();
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message)
            }
        }
    }

    const handleAddNote = () => {
        if (!title) {
            setError("Please enter the title");
            return;
        }
        if (!content) {
            setError("Please enter the content");
            return;
        }
        setError("");
        if (type === 'edit') {
            editNote();
        } else {
            addNewNote();
        }
    }
    return (
        <div className='relative'>
            <button onClick={onClose} className='w-10 h-10 rounded-full flex items-center justify-center absolute -top-3 -right-3 hover:bg-slate-100 transition-colors'>
                <MdClose className='text-xl text-slate-400' />
            </button>
            <div className='flex flex-col gap-2'>
                <label className='input-label font-semibold text-xs text-slate-500'>TITLE</label>
                <input type="text" className='text-2xl text-slate-950 outline-none' placeholder='Meeting' value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className='flex flex-col gap-2 mt-4'>
                <label className='input-label font-semibold text-xs text-slate-500'>CONTENT</label>
                <textarea
                    type='text'
                    className='text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded-lg border border-slate-100 focus:border-slate-300 transition-colors resize-y'
                    placeholder='Content'
                    rows={10} value={content} onChange={(e) => setContent(e.target.value)} />
            </div>
            <div className='mt-3'>
                <label className='input-label'>TAGS</label>
                <TagInput tags={tags} setTags={setTags} />
            </div>
            <div className='mt-4'>
                <label className='input-label font-semibold text-xs text-slate-500'>COLOR</label>
                <div className='flex gap-2 mt-2'>
                    {COLORS.map((c) => (
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => setColor(c.bg)}
                            title={c.label}
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c.bg ? 'border-primary' : 'border-gray-200'}`}
                            style={{ backgroundColor: c.bg }}
                        />
                    ))}
                </div>
            </div>
            <div className='mt-4'>
                <label className='input-label font-semibold text-xs text-slate-500'>
                    ATTACHMENT
                </label>

                <input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className='text-sm mt-2 block w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-blue-600 cursor-pointer transition-colors'
                />

                {uploading && (
                    <p className="text-xs text-blue-500 mt-2 animate-pulse">
                        Uploading attachment... please wait ⏳
                    </p>
                )}

                {attachmentUrl && !uploading && (
                    <div className='mt-2 text-xs text-blue-500 underline flex items-center justify-between'>
                        <a href={attachmentUrl} target="_blank" rel="noreferrer">
                            View Current Attachment
                        </a>

                        <button
                            type="button"
                            onClick={() => {
                                setAttachmentUrl(null);
                                attachmentRef.current = null;
                            }}
                            className='ml-4 text-red-500 font-medium no-underline hover:text-red-600'
                        >
                            Remove
                        </button>
                    </div>
                )}
            </div>
            {error && <p className='text-red-500 text-xs pt-4'>{error}</p>}
            <button onClick={handleAddNote} className='btn-primary font-medium mt-5 p-3 w-full rounded-lg'>
                {type === 'edit' ? "Update" : "Add"}
            </button>
        </div>
    )
}

export default AddEditNotes