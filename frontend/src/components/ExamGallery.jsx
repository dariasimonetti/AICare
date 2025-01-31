import React, { useState, useEffect } from "react";
import { uploadFile, getPatientFiles, viewFile, deleteFile } from "../utils/api";
import docpng from '../assets/doc.png'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'

function ExamGallery({ patientId }){
    const [isHovered, setIsHovered] = useState(false);
    const [files, setFiles] = useState([]);

    const fetchFiles = async () => {
        try {
        const fetchedFiles = await getPatientFiles(patientId);
        setFiles(fetchedFiles);
        } catch (error) {
        console.error("Error fetching files:", error);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
        await uploadFile(patientId, file);
        fetchFiles(); // Ricarica la lista dei file
        } catch (error) {
        alert("Error uploading file");
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const slideLeft = () =>{
        var slider = document.getElementById('slider')
        slider.scrollLeft = slider.scrollLeft - 500
    }

    const slideRight = () =>{
        var slider = document.getElementById('slider')
        slider.scrollLeft = slider.scrollLeft + 500
    }

    const handleDeleteFile = async (fileId) => {
        if (!fileId) return;
      
        // Chiedi conferma all'utente
        const confirmDelete = window.confirm(
          "Are you sure you want to delete this file? The operation cannot be undone."
        );
      
        if (!confirmDelete) {
          return;
        }
      
        try {
          // Chiamata all'API per eliminare il file dal database
          await deleteFile(fileId);
      
          // Aggiorna lo stato per rimuovere il file dall'interfaccia
          setFiles((prevFiles) => prevFiles.filter((file) => file.file_id !== fileId));
      
        } catch (error) {
          console.error("Errore durante l'eliminazione del file:", error);
        }
    };
      


    return (
        <>
        <input type="file" onChange={handleFileUpload} className="hidden" id="fileUpload"/>
        <label htmlFor="fileUpload" className="bg-[#3660A9] text-sm text-white mb-5 px-4 py-2 rounded cursor-pointer">
            Upload File
        </label>
            
        <div className="flex justify-center items-center w-full overflow-hidden">
            <MdChevronLeft onClick={slideLeft} className="text-[#3660A9] opacity-50 cursor-pointer hover:opacity-100" size={40}/>
            <div id="slider" className="lg:max-w-3xl xl:max-w-3xl 2xl:max-w-3xl max-w-[450px] w-full h-auto overflow-hidden overflow-x-scroll whitespace-nowrap scroll-smooth scrollbar-none">
                {files.map((file) => (
                    <div key={file.file_id} className="inline-block">
                        <div className=" group flex  flex-col items-center  w-[200px]  p-2">
                            <img src={docpng} className="w-[120px] cursor-pointer hover:scale-105 ease-in-out duration-300 " alt="/" onClick={() => viewFile(patientId, file.file_id)}/>
                            <p className="truncate w-[80%] text-black text-center mt-2" title={file.filename}>{file.filename}</p>
                            <button className="b mt-5 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteFile(file.file_id)}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 69 14" className="svgIcon bin-top">
                                    <g clipPath="url(#clip0_35_24)">
                                    <path fill="black" d="M20.8232 2.62734L19.9948 4.21304C19.8224 4.54309 19.4808 4.75 19.1085 4.75H4.92857C2.20246 4.75 0 6.87266 0 9.5C0 12.1273 2.20246 14.25 4.92857 14.25H64.0714C66.7975 14.25 69 12.1273 69 9.5C69 6.87266 66.7975 4.75 64.0714 4.75H49.8915C49.5192 4.75 49.1776 4.54309 49.0052 4.21305L48.1768 2.62734C47.3451 1.00938 45.6355 0 43.7719 0H25.2281C23.3645 0 21.6549 1.00938 20.8232 2.62734ZM64.0023 20.0648C64.0397 19.4882 63.5822 19 63.0044 19H5.99556C5.4178 19 4.96025 19.4882 4.99766 20.0648L8.19375 69.3203C8.44018 73.0758 11.6746 76 15.5712 76H53.4288C57.3254 76 60.5598 73.0758 60.8062 69.3203L64.0023 20.0648Z"></path>
                                    </g>
                                    <defs>
                                    <clipPath id="clip0_35_24">
                                        <rect fill="white" height="14" width="69"></rect>
                                    </clipPath>
                                    </defs>
                                </svg>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 69 57" className="svgIcon bin-bottom">
                                    <g clipPath="url(#clip0_35_22)">
                                    <path fill="black" d="M20.8232 -16.3727L19.9948 -14.787C19.8224 -14.4569 19.4808 -14.25 19.1085 -14.25H4.92857C2.20246 -14.25 0 -12.1273 0 -9.5C0 -6.8727 2.20246 -4.75 4.92857 -4.75H64.0714C66.7975 -4.75 69 -6.8727 69 -9.5C69 -12.1273 66.7975 -14.25 64.0714 -14.25H49.8915C49.5192 -14.25 49.1776 -14.4569 49.0052 -14.787L48.1768 -16.3727C47.3451 -17.9906 45.6355 -19 43.7719 -19H25.2281C23.3645 -19 21.6549 -17.9906 20.8232 -16.3727ZM64.0023 1.0648C64.0397 0.4882 63.5822 0 63.0044 0H5.99556C5.4178 0 4.96025 0.4882 4.99766 1.0648L8.19375 50.3203C8.44018 54.0758 11.6746 57 15.5712 57H53.4288C57.3254 57 60.5598 54.0758 60.8062 50.3203L64.0023 1.0648Z"></path>
                                    </g>
                                    <defs>
                                    <clipPath id="clip0_35_22">
                                        <rect fill="white" height="57" width="69"></rect>
                                    </clipPath>
                                    </defs>
                                </svg>
                            </button>

                        </div>
                    </div>
                ))}
            </div>
            <MdChevronRight onClick={slideRight} className="text-[#3660A9] opacity-50 cursor-pointer hover:opacity-100" size={40}/>
        </div>

        </>
    );
}

export default ExamGallery