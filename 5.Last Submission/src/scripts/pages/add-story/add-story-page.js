import AddStoryPresenter from './add-story-presenter';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

export default class AddStoryPage {
  #presenter;
  #videoElement;
  #photoCanvasElement;
  #capturedCameraDataURL = null;
  #map = null;
  #marker = null;
  #selectedCoords = null;

  constructor() {
    this.#presenter = new AddStoryPresenter({ view: this });
  }

  async render() {
    return `
            <section class="add-story view-transition-content">
                <div class="heading--container" aria-label="Heading Container">
                    <h1 aria-label="Add Story Page">Tambah Cerita Baru</h1>
                    <p aria-label="Deskripsi Add Story Page">Ambil photo atau upload photo serta masukkan deskripsi ya!</p>
                </div>

                <form id="storyForm" class="story-form" method="POST" enctype="multipart/form-data">
                    <div class="camera-preview">
                        <video id="cameraView" class="camera-view" muted playsinline></video>
                        <canvas id="photoCanvas" class="photo-canvas" hidden></canvas>
                        <button type="button" id="captureBtn" aria-label="Ambil foto" class="capture-btn">
                        <i class="fas fa-camera"></i>
                        </button>
                    </div>

                    <div class="form-group">
                        <label for="description">Deskripsi</label>
                        <textarea 
                        id="description" 
                        name="description" 
                        placeholder="Ceritakan pengalamanmu..." 
                        required
                        maxlength="1000"
                        rows="5"
                        ></textarea>
                    </div>

                    <div class="form-group">
                        <label for="photoFile">Atau Unggah Foto</label>
                        <input 
                        type="file" 
                        id="photoFile" 
                        name="photo" 
                        accept="image/*" 
                        class="file-input"
                        />
                    </div>
                    
                  <div class="form-group map-group">
                    <label for="mapContainer">Pilih Lokasi Cerita (Klik pada Peta)</label>
                    <div id="mapContainer" style="height: 300px; width: 100%; border: 1px solid #ccc; margin-bottom: 10px;"></div>
                    <p id="selectedLocationText" aria-live="polite" style="font-size: 0.9em; color: #555;">Lokasi belum dipilih.</p>
                  </div>

            
                  <button type="submit" class="confirm-button">Publikasikan</button>
                    
                </form>
                <div id="errorMessage" class="error-message" hidden aria-live="polite"></div>
                <div id="successMessage" class="success-message" hidden aria-live="polite">Cerita berhasil ditambahkan!</div>
            </section>

        `;
  }

  async afterRender() {
    this.#videoElement = document.getElementById('cameraView');
    this.#photoCanvasElement = document.getElementById('photoCanvas');

    document
      .getElementById('captureBtn')
      .addEventListener('click', () => this.handleCaptureButtonClick());
    document.getElementById('photoFile').addEventListener('change', (e) => {
      this.#capturedCameraDataURL = null;
      this.#videoElement.style.display = 'block';
      this.#photoCanvasElement.setAttribute('hidden', true);
      const file = e.target.files[0];

      this.#presenter.handleFileInput(file);
    });

    document
      .getElementById('storyForm')
      .addEventListener('submit', (e) => this.handleSubmit(e));

    this.#initializeMap();
    await this.#presenter.initializeCamera();
  }

  #initializeMap() {
    if (typeof L === 'undefined') {
      console.error('Leaflet library (L) is not loaded!');
      const mapContainer = document.getElementById('mapContainer');
      if (mapContainer) {
        mapContainer.innerHTML =
          '<p style="color: red; text-align: center; padding: 20px;">Peta tidak dapat dimuat. Pastikan Leaflet.js terpasang.</p>';
      }
      return;
    }

    this.#map = L.map('mapContainer').setView([-2.548926, 118.0148634], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      this.#selectedCoords = { latitude: lat, longitude: lng };

      if (this.#marker) {
        this.#marker.setLatLng(e.latlng);
      } else {
        this.#marker = L.marker(e.latlng).addTo(this.#map);
      }
      this.#marker
        .bindPopup(`Lokasi dipilih: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
        .openPopup();

      const selectedLocationTextElement = document.getElementById(
        'selectedLocationText'
      );
      if (selectedLocationTextElement) {
        selectedLocationTextElement.textContent = `Lokasi dipilih: Lat: ${lat.toFixed(5)}, Lon: ${lng.toFixed(5)}`;
      }
    });

    const useCurrentLocationButton = L.control({ position: 'topright' });
    useCurrentLocationButton.onAdd = () => {
      const button = L.DomUtil.create(
        'button',
        'leaflet-bar leaflet-control leaflet-control-custom'
      );
      button.innerHTML =
        '<i class="fas fa-map-marker-alt" aria-hidden="true"></i>';
      button.setAttribute('aria-label', 'Gunakan lokasi saya saat ini');
      button.title = 'Gunakan lokasi saya saat ini';
      button.style.backgroundColor = 'white';
      button.style.width = '30px';
      button.style.height = '30px';
      button.style.cursor = 'pointer';
      button.style.fontSize = '1.2em';

      L.DomEvent.on(button, 'click', (ev) => {
        L.DomEvent.stopPropagation(ev);
        this.#centerMapOnUserLocation();
      });
      return button;
    };
    useCurrentLocationButton.addTo(this.#map);
  }

  #centerMapOnUserLocation() {
    if (navigator.geolocation) {
      this.showLoadingIndicatorForMap();
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.hideLoadingIndicatorForMap();
          const { latitude, longitude } = position.coords;
          this.#map.setView([latitude, longitude], 13);

          this.#selectedCoords = { latitude, longitude };
          if (this.#marker) {
            this.#marker.setLatLng([latitude, longitude]);
          } else {
            this.#marker = L.marker([latitude, longitude]).addTo(this.#map);
          }
          this.#marker
            .bindPopup(
              `Lokasi Anda: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            )
            .openPopup();
          const selectedLocationTextElement = document.getElementById(
            'selectedLocationText'
          );
          if (selectedLocationTextElement) {
            selectedLocationTextElement.textContent = `Lokasi dipilih (saat ini): Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`;
          }
        },
        (error) => {
          this.hideLoadingIndicatorForMap();
          console.error('Error getting current location for map:', error);
          this.showLocationError(
            'Tidak dapat mengambil lokasi Anda saat ini. Pastikan izin lokasi diberikan.'
          );
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      this.showLocationError(
        'Fitur Geolocation tidak didukung oleh browser Anda.'
      );
    }
  }

  showLoadingIndicatorForMap() {
    const mapContainer = document.getElementById('mapContainer');
    if (mapContainer && !mapContainer.querySelector('.map-loading-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'map-loading-overlay';
      overlay.style.position = 'absolute';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
      overlay.style.display = 'flex';
      overlay.style.justifyContent = 'center';
      overlay.style.alignItems = 'center';
      overlay.style.zIndex = '1000';
      overlay.innerHTML =
        '<div class="loading-spinner"></div> <span style="margin-left:10px;">Mencari lokasi...</span>';
      mapContainer.style.position = 'relative';
      mapContainer.appendChild(overlay);
    }
  }

  hideLoadingIndicatorForMap() {
    const overlay = document.querySelector(
      '#mapContainer .map-loading-overlay'
    );
    if (overlay) {
      overlay.remove();
    }
  }

  setCameraStream(stream) {
    this.#videoElement.srcObject = stream;
    this.#videoElement.addEventListener('loadedmetadata', () => {
      this.#videoElement.play().catch((error) => {
        console.log('Video play interrupted:', error);
      });
    });
  }

  showLoadingIndicatorForSubmit() {
    const submitButton = document.querySelector('.confirm-button');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML =
        '<div class="loading-spinner-small"></div> Mengunggah...';
    }
  }

  hideLoadingIndicatorForSubmit() {
    const submitButton = document.querySelector('.confirm-button');
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Publikasikan';
    }
  }

  captureCameraFrame() {
    const context = this.#photoCanvasElement.getContext('2d');
    const maxWidth = 640;
    const maxHeight = 480;
    let width = this.#videoElement.videoWidth;
    let height = this.#videoElement.videoHeight;

    if (width > maxWidth) {
      height *= maxWidth / width;
      width = maxWidth;
    }
    if (height > maxHeight) {
      width *= maxHeight / height;
      height = maxHeight;
    }
    this.#photoCanvasElement.width = width;
    this.#photoCanvasElement.height = height;
    context.drawImage(this.#videoElement, 0, 0, width, height);
    return this.#photoCanvasElement.toDataURL('image/jpeg', 0.8);
  }

  showCameraError(message) {
    document.getElementById('errorMessage').textContent = message;
  }

  showLocationError(message) {
    document.getElementById('errorMessage').textContent = message;
  }

  showSubmitError(message) {
    document.getElementById('errorMessage').hidden = false;
    document.getElementById('errorMessage').textContent = message;
  }

  showStoryAddedMessage() {
    const successMessageElement = document.getElementById('successMessage');
    if (successMessageElement) {
      successMessageElement.removeAttribute('hidden');
      setTimeout(() => {
        successMessageElement.setAttribute('hidden', true);
      }, 3000);
    } else {
      console.error("Elemen dengan ID 'successMessage' tidak ditemukan!");
    }
  }

  navigateToHomepage() {
    window.dispatchEvent(new CustomEvent('story-added'));
    window.location.hash = '#/homepage';
  }

  async handleCaptureButtonClick() {
    const photoDataURL = this.#presenter.capturePhoto();
    if (photoDataURL) {
      this.#capturedCameraDataURL = photoDataURL;
      this.#videoElement.style.display = 'none';
      this.#photoCanvasElement.removeAttribute('hidden');

      const photoFileInput = document.getElementById('photoFile');
      if (photoFileInput) {
        photoFileInput.value = '';
        console.log('handleCaptureButtonClick: File input reset.');
      } else {
        console.log(
          'handleCaptureButtonClick: No photoDataURL returned from presenter.'
        );
      }
    }
  }

  async #compressImageFile(
    file,
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.7
  ) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                console.log(
                  `Original size: ${(file.size / 1024 / 1024).toFixed(2)} MB`
                );
                console.log(
                  `Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`
                );
                resolve(compressedFile);
              } else {
                reject(new Error('Canvas toBlob failed.'));
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async handleSubmit(event) {
    event.preventDefault();
    this.showLoadingIndicatorForSubmit();
    const form = event.target;
    const formData = new FormData(form);

    let originalImageFileFromInput = formData.get('photo');
    let processedImageFile = null;

    formData.delete('photo');

    if (this.#capturedCameraDataURL) {
      try {
        const blob = await fetch(this.#capturedCameraDataURL).then((r) =>
          r.blob()
        );
        const timestamp = new Date().getTime();
        const filename = `captured_${timestamp}.jpg`;
        processedImageFile = new File([blob], filename, { type: 'image/jpeg' });
      } catch (error) {
        console.error('Error converting camera dataURL to blob:', error);
        this.showSubmitError('Gagal memproses foto dari kamera.');
        return;
      }
    } else if (
      originalImageFileFromInput &&
      originalImageFileFromInput.size > 0
    ) {
      processedImageFile = originalImageFileFromInput;
      try {
        const maxSizeBeforeCompression = 1 * 1024 * 1024;
        if (processedImageFile.size > maxSizeBeforeCompression) {
          console.log(
            `Uploaded file is large (${processedImageFile.size} bytes), attempting compression.`
          );
          this.showSubmitError('Ukuran file besar, mencoba mengompres...');
          processedImageFile = await this.#compressImageFile(
            processedImageFile,
            800,
            800,
            0.7
          );
          console.log('Compressed file size:', processedImageFile.size);
        }

        if (processedImageFile.size > maxSizeBeforeCompression) {
          this.showSubmitError(
            `Ukuran file setelah kompresi masih terlalu besar: ${(processedImageFile.size / 1024 / 1024).toFixed(2)} MB.`
          );
          this.hideLoadingIndicatorForSubmit();
          return;
        }
        console.log(
          'Uploaded file processed (possibly compressed):',
          processedImageFile.name
        );
      } catch (error) {
        console.error('Error compressing image:', error);
        this.showSubmitError(
          'Gagal mengompres gambar. Coba file lain atau ukuran lebih kecil.'
        );
        this.hideLoadingIndicatorForSubmit();
        return;
      }
    } else {
      this.showSubmitError(
        'Foto harus disertakan, baik dari kamera atau unggahan.'
      );
      this.hideLoadingIndicatorForSubmit();
      return;
    }

    if (!processedImageFile) {
      console.error(
        'Critical Error: processedImageFile is unexpectedly null after processing paths.'
      );
      this.showSubmitError(
        'Terjadi kesalahan internal saat menyiapkan gambar.'
      );
      this.hideLoadingIndicatorForSubmit();
      return;
    }
    formData.append('photo', processedImageFile, processedImageFile.name);

    if (this.#selectedCoords) {
      formData.append('lat', this.#selectedCoords.latitude);
      formData.append('lon', this.#selectedCoords.longitude);
    } else {
      this.showSubmitError('Lokasi harus dipilih dari peta.');
      this.hideLoadingIndicatorForSubmit();
      console.log('Lokasi tidak dipilih dari peta.');
    }

    await this.#presenter.submitStory(formData);
  }

  destroy() {
    if (this.#presenter) {
      this.#presenter.destroy();
      console.log('AddStoryPage: Cleaning up camera resources');
    }
    if (this.#map) {
      this.#map.remove();
      this.#map = null;
    }
    console.log('ADD STORY PAGE BERSIH');
  }
}
