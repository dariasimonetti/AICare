# AICare
*presentazione di AICare da scrivere*
![logoAICare](https://github.com/user-attachments/assets/ebe0148a-77d6-4b2e-b228-f33284077e1c)

# Requirements📋
You need to install:
+ [Node.js](https://nodejs.org/en)
+ [MongoDB Community Server](https://www.mongodb.com/try/download/community) : during the installation check the box “Install MongoDB Compass”
+ [Visual Studio Build Tools](https://visualstudio.microsoft.com/it/visual-cpp-build-tools/) : during the installation check the box “C++ Build Tools”
+ [Mistral 7B OpenOrca Q8](https://huggingface.co/TheBloke/Mistral-7B-OpenOrca-GGUF/blob/main/mistral-7b-openorca.Q8_0.gguf)
+ [Python 3.13.1](https://www.python.org/downloads/release/python-3131/)

# Instructions📖
1. Open MongoDB Compass and create a new database named "AICare" with the following collections in it:
   + Patients
   + doctors
   + fs.files
   + fs.chunks
2. Clone the repository into VSCode
3. From the “Database” folder of the repository import the files into the respective collections.
4. Create a new folder into the backend one named "model"
5. Copy the file "mistral-7b-openorca.Q8_0.gguf" into the folder "model"
6. Open the .env file in the backend folder and change the connection string of the database with you own (it might be the same)
7. Open the VSCode terminal and create a virtual environment in the main folder of the project:<br>
   ```python -m venv .venv```
8. After the creation of the virtual environment activate it and install the requirments:<br>
   ```.venv\Scripts\activate```<br>
   ```cd backend```<br>
    ```pip install -r requirements.txt```
9. Deactivate the virtual environment:<br>
   ```deactivate```
10. Install concurrently:<br>
```cd ../frontend```<br>
   ```npm install concurrently --save-dev --legacy-peer-deps```
11. Now you are ready to launch the web application, every time you want to run the project just type:<br>
   ```npm run dev```
