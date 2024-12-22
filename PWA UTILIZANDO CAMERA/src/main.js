// Registrando o service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      let reg = await navigator.serviceWorker.register("/sw.js", { type: "module" });
      console.log("Service worker registrado!", reg);
    } catch (err) {
      console.log("Registro do service worker falhou: ", err);
    }
  });
}

// Configurando as constraints do vídeo
let useFrontCamera = true; // Controle para trocar câmera
let stream = null; // Armazena o stream da câmera
const constraints = { video: { facingMode: "user" }, audio: false };

// Capturando os elementos em tela
const cameraView = document.querySelector("#camera--view"),
  cameraOutput = document.querySelector("#camera--output"),
  cameraSensor = document.querySelector("#camera--sensor"),
  cameraTrigger = document.querySelector("#camera--trigger"),
  cameraSwitch = document.querySelector("#camera--switch"),
  photoGallery = document.querySelector("#photo-gallery");

// IndexedDB configuração
const dbName = "CameraAppDB";
const storeName = "PhotosDB";

// Função para abrir IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

// Função para salvar imagem no IndexedDB
async function savePhoto(data) {
  const db = await openDB();
  const tx = db.transaction(storeName, "readwrite");
  tx.objectStore(storeName).add({ timestamp: Date.now(), data });
}

// Função para obter as 3 últimas fotos do IndexedDB
async function getLastPhotos() {
  const db = await openDB();
  const tx = db.transaction(storeName, "readonly");
  const store = tx.objectStore(storeName);
  const photos = [];
  const request = store.openCursor(null, "prev");
  return new Promise((resolve) => {
    request.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor && photos.length < 3) {
        photos.push(cursor.value.data);
        cursor.continue();
      } else {
        resolve(photos);
      }
    };
  });
}

// Atualiza a galeria de fotos
async function updateGallery() {
  const photos = await getLastPhotos();
  photoGallery.innerHTML = photos
    .map((src) => `<img src="${src}" alt="Última foto capturada" />`)
    .join("");
}

// Inicializa o stream da câmera
async function cameraStart() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
  constraints.video.facingMode = useFrontCamera ? "user" : "environment";
  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    cameraView.srcObject = stream;
  } catch (error) {
    console.error("Ocorreu um erro ao acessar a câmera.", error);
  }
}

// Tira uma foto e armazena
cameraTrigger.onclick = async function () {
  cameraSensor.width = cameraView.videoWidth;
  cameraSensor.height = cameraView.videoHeight;
  cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);
  const photo = cameraSensor.toDataURL("image/webp");
  cameraOutput.src = photo;
  cameraOutput.classList.add("taken");
  await savePhoto(photo);
  updateGallery();
};

// Alterna entre as câmeras
cameraSwitch.onclick = function () {
  useFrontCamera = !useFrontCamera;
  cameraStart();
};

// Inicializa a câmera e a galeria ao carregar a página
window.addEventListener("load", () => {
  cameraStart();
  updateGallery();
});
