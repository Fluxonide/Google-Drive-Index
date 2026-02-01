import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface RenameFileModalProps {
    isOpen: boolean
    fileName: string
    onClose: () => void
    onRename: (newName: string) => Promise<void>
}

const RenameFileModal = ({ isOpen, fileName, onClose, onRename }: RenameFileModalProps) => {
    const [newName, setNewName] = useState(fileName)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        setNewName(fileName)
    }, [fileName, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newName || newName === fileName) return

        setIsSubmitting(true)
        try {
            await onRename(newName)
            onClose()
        } catch (error) {
            // Error handling is done in parent
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/70" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-[#18181B] dark:border dark:border-gray-700">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                                >
                                    Rename File
                                </Dialog.Title>
                                <form onSubmit={handleSubmit} className="mt-4">
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="filename" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                New Name
                                            </label>
                                            <input
                                                type="text"
                                                id="filename"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white px-3 py-2 border"
                                                value={newName}
                                                onChange={(e) => setNewName(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                                            onClick={onClose}
                                            disabled={isSubmitting}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={isSubmitting || !newName || newName === fileName}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <FontAwesomeIcon icon="spinner" className="mr-2 animate-spin" />
                                                    Renaming...
                                                </>
                                            ) : (
                                                'Rename'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

export default RenameFileModal
