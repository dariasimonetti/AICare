function PatientPreview({onClick , nome, eta, sesso}){

    return(
        <>
      <div
        className="bg-gray-50 hover:bg-gray-100 p-4 cursor-pointer rounded-md border border-[#3660A9] transition-colors duration-300 flex justify-between items-center"
        onClick={onClick}
      >
        {/* Contenitore del nome ed età */}
        <div>
          <h3 className="text-lg font-semibold text-black">{nome}</h3>
          <p className="text-gray-600">{eta} years</p>
        </div>

        {/* Icona di genere posizionata a destra */}
        <div className="text-2xl">
          {sesso === "F" ? (
            <ion-icon name="female-outline" style={{ color: "#ff92a9", fontSize:"32px" }}></ion-icon>
          ) : (
            <ion-icon name="male-outline" style={{ color: "#2778A8",fontSize:"32px" }}></ion-icon>
          )}
        </div>
      </div>
    </>
    );

}

export default PatientPreview