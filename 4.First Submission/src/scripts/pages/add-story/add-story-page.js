export default class AddStoryPage{
    #mediaStream;
    #capturedPhoto;
    #geoLocation;

    constructor(){
        this.#mediaStream = null;
        this.#capturedPhoto = null;
        this.#geoLocation = null;
    }

    async render(){
        return `
            <section class="add-story">
                <h1>Tambah Cerita Baru!</h1>

                <form id="storyForm" class="story-form">
                    <div class="camera-preview">
                        <video id="cameraView" class="camera-view" muted playsinline></video>
                        <canvas id="photoCanvas" class="photo-canvas" hidden></canvas>
                        <button type="button" id="captureBtn" class="capture-btn">
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

                    <div class="form-group location-group">
                        <label>
                        <input type="checkbox" id="includeLocation" />
                        Sertakan Lokasi Saat Ini
                        </label>
                    </div>

                     <div class="form-actions">
                        <button type="submit" class="submit-btn">Publikasikan</button>
                    </div>
                </form>
                <div id="errorMessage" class="error-message"></div>
            </section>

        `
    }

    // async afterRender(){
    //     await this.initializeCamera();
    //     // Setup event listeners
    //     document.getElementById('captureBtn').addEventListener('click', () => this.capturePhoto());
    //     document.getElementById('photoFile').addEventListener('change', (e) => this.handleFileInput(e));
    //     document.getElementById('includeLocation').addEventListener('change', (e) => this.handleLocation(e));
    //     document.getElementById('storyForm').addEventListener('submit', (e) => this.handleSubmit(e));
    // }

    async afterRender() {
        // Simpan referensi event listeners untuk cleanup
        this._captureHandler = () => this.capturePhoto();
        this._fileInputHandler = (e) => this.handleFileInput(e);
        this._locationHandler = (e) => this.handleLocation(e);
        this._submitHandler = (e) => this.handleSubmit(e);

        document.getElementById('captureBtn').addEventListener('click', this._captureHandler);
        document.getElementById('photoFile').addEventListener('change', this._fileInputHandler);
        document.getElementById('includeLocation').addEventListener('change', this._locationHandler);
        document.getElementById('storyForm').addEventListener('submit', this._submitHandler);
    }

    async initializeCamera(){
        try {
            this.#mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });
            const videoElement = document.getElementById('cameraView');
            videoElement.srcObject = this.#mediaStream;
            await videoElement.play().catch(error=>{
                console.log("Video play interrupted:",error)
            });
        } catch (error) {
            console.error('Error accessing camera:', error);
            document.getElementById('errorMessage').textContent = 'Akses kamera ditolak. Silakan unggah foto manual.';
        }
    }

    capturePhoto() {
        const video = document.getElementById('cameraView');
        const canvas = document.getElementById('photoCanvas');
        const context = canvas.getContext('2d');
    
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        this.#capturedPhoto = canvas.toDataURL('image/jpeg');

        this.#stopMediaStream();

    }

    #stopMediaStream() {
        if (this.#mediaStream) {
            this.#mediaStream.getTracks().forEach(track => {
                track.stop();
                track.enabled = false;
            });
            this.#mediaStream = null;
            
            // Bersihkan video element
            const video = document.getElementById('cameraView');
            video.srcObject = null;
            video.load();   
        }
    }

    handleFileInput(event) {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.capturedPhoto = e.target.result;
          };
          reader.readAsDataURL(file);
        }
      }
    
      async handleLocation(event) {
        if (event.target.checked) {
          try {
            this.geoLocation = await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000
              });
            });
          } catch (error) {
            console.error('Error getting location:', error);
            document.getElementById('errorMessage').textContent =
              'Gagal mendapatkan lokasi. Pastikan izin lokasi diberikan.';
            event.target.checked = false;
          }
        } else {
          this.geoLocation = null;
        }
      }



      async handleSubmit(event) {
        event.preventDefault();
        const formData = new FormData();
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = '';
    
        // Validasi
        const description = document.getElementById('description').value;
        if (!description || !this.capturedPhoto) {
          errorMessage.textContent = 'Deskripsi dan foto harus diisi!';
          return;
        }
    
        // Prepare form data
        formData.append('description', description);
        
        // Handle photo
        const photoInput = document.getElementById('photoFile');
        if (photoInput.files[0]) {
          formData.append('photo', photoInput.files[0]);
        } else {
          const blob = await fetch(this.capturedPhoto).then(r => r.blob());
          formData.append('photo', blob, 'captured.jpg');
        }
    
        // Handle location
        if (this.geoLocation) {
          formData.append('lat', this.geoLocation.coords.latitude);
          formData.append('lon', this.geoLocation.coords.longitude);
        }
    
        // Submit data
        try {
          const response = await fetch('/stories', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
          });
    
          if (!response.ok) throw new Error('Gagal mengunggah cerita');
    
          // Redirect ke homepage dan refresh data
          window.dispatchEvent(new CustomEvent('story-added'));
          window.location.hash = '#/homepage';
        } catch (error) {
          console.error('Submission error:', error);
          errorMessage.textContent = 'Gagal mengunggah cerita. Coba lagi.';
        }
      }

    destroy() {
        this.#stopMediaStream();
        
        // Hapus event listeners
        document.getElementById('captureBtn').removeEventListener('click', this._captureHandler);
        document.getElementById('photoFile').removeEventListener('change', this._fileInputHandler);
        document.getElementById('includeLocation').removeEventListener('change', this._locationHandler);
        document.getElementById('storyForm').removeEventListener('submit', this._submitHandler);
    }
      
}