import React from 'react'
import {MdOutlinePushPin ,MdCreate ,MdDelete, MdArchive, MdUnarchive, MdRestore, MdDeleteForever} from 'react-icons/md'
import moment from 'moment'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const NoteCard = ({
    key,
    title,
    date,
    content,
    tags,
    isArchived,
    isTrashed,
    isPinned,
    color,
    attachmentUrl,
    onEdit,
    onDelete,
    onPinNote,
    onArchive,
    onRestore,
    onPermanentDelete,
}) => {
  return (
    <div className={`border border-gray-300 rounded m-4 p-4 hover:shadow-xl transition-all ease-in-out`} style={{ backgroundColor: color || 'white' }}>
        <div className='flex items-center justify-between'>
            <div>
                <h6 className={`text-sm font-medium ${isTrashed ? 'line-through text-slate-400' : ''}`}>{title}</h6>
                <span className='text-xs text-slate-500'>{moment(date).format("Do MMM YYYY")}</span>
            </div>
            {!isTrashed && !isArchived && <MdOutlinePushPin className={`icon-btn2 ${isPinned ? 'text-primary' : 'text-slate-300'}`} onClick={onPinNote}/>}
        </div>
        <div className='text-xs text-slate-600 mt-2 markdown-content overflow-hidden text-ellipsis max-h-40'>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content?.length > 200 ? content.slice(0,200) + '...' : content}
            </ReactMarkdown>
        </div>
        {attachmentUrl && (
            <div className='mt-3'>
                {attachmentUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                    <img src={attachmentUrl} alt="attachment" className="w-full h-32 object-cover rounded-md" />
                ) : (
                    <a href={attachmentUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 font-medium underline">View Attachment</a>
                )}
            </div>
        )}
        <div className='flex items-center justify-between mt-3'>
            <div className='text-slate-500 text-xs'>{tags.map((tag)=>`#${tag} `)}</div>
            <div className='flex items-center gap-2'>
                {isTrashed ? (
                    <>
                        <MdRestore className='icon-btn hover:text-green-600' onClick={onRestore} title="Restore" />
                        <MdDeleteForever className='icon-btn hover:text-red-500' onClick={onPermanentDelete} title="Permanent Delete" />
                    </>
                ) : (
                    <>
                        <MdCreate className='icon-btn hover:text-green-600' onClick={onEdit} title="Edit" />
                        {isArchived ? (
                            <MdUnarchive className='icon-btn hover:text-blue-500' onClick={onArchive} title="Unarchive" />
                        ) : (
                            <MdArchive className='icon-btn hover:text-blue-500' onClick={onArchive} title="Archive" />
                        )}
                        <MdDelete className='icon-btn hover:text-red-500' onClick={onDelete} title="Trash" />
                    </>
                )}
            </div>
        </div>
    </div>
  )
}

export default NoteCard