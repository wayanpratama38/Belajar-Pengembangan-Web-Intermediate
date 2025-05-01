import StoryModel from "../../data/story-api";

export default class AddStoryPresenter{
    #view;
    #model;
    #mediaStream;
    #capturedPhoto;
    #geoLocation;

    constructor({view}){
        this.#model = StoryModel;
        this.#view = view;
        this.#mediaStream = null;
        this.#capturedPhoto = null;
        this.#geoLocation = null;
    }

    async initializeCamera(){
        try{
            this.#mediaStream = await navigator.mediaDevices.getUserMedia({
                video : {facingMode : "environment"},
                audio : false,
            });

            const videoElement = document.getElementById("cameraView");
            videoElement.srcObject = this.#mediaStream;

         
            videoElement.addEventListener('loadedmetadata', () => {
                videoElement.play().catch(error => {
                    console.log("Video play interrupted:", error);
                });
            });
        } catch (error){
            console.log("Error Accessing camera ; ",error);
            this.#view.showCameraError( "Akses kamera ditolak!")
        } 
    }

    capturePhoto(){
        if(!this.#mediaStream) return;
        // const photoData = this.#view.captureCameraFrame();
        // this.#capturedPhoto = photoData;
        // this.#stopMediaStream();
        return this.#view.captureCameraFrame();
    }

    #stopMediaStream(){
        if(this.#mediaStream){
            this.#mediaStream.getTracks().forEach((track)=>{
                track.stop();
                track.enabled = false;
            });
            this.#mediaStream = null;
            const video = document.getElementById('cameraView');
            video.srcObject = null;
            
        }
    }

    handleFileInput(file){
        if(file){
            const reader = new FileReader();
            reader.onload = (e) =>{
                this.#capturedPhoto = e.target.result;
            };
            reader.readAsDataURL(file);
            console.log("NAMA FILE YANG DIUNGGAH : ",file.name)
        }
    }

    async handleLocation(isChecked){
        if(isChecked){
            try {
                this.#geoLocation = await this.#getCurrentLocation();
                this.#view.setLocationStatus(true);
            } catch (error) { 
                console.log("ERROR GETTING LOCATION : ",error);
                this.#view.showLocationError("GAGAL MENDAPATKAN LOKASI");
                this.#view.setLocationStatus(false);
            }
        }else{
            this.#geoLocation = null;
            this.#view.setLocationStatus(false);
        }
    }

    async #getCurrentLocation(){
        return new Promise((resolve,reject)=>{
            navigator.geolocation.getCurrentPosition(resolve,reject, {
                enableHighAccuracy : true,
                timeout : 5000,
            })
        })
    }


    async submitStory(formData){
        const description = formData.get('description');
        const photoFile = formData.get("photo");
        console.log("SUBMIT STORY : ",photoFile);

        if (!description || !photoFile) {
            this.#view.showSubmitError('Deskripsi dan foto harus diisi!');
            return;
        }
      
        const submitFormData = new FormData();
        submitFormData.append('description', description);
        submitFormData.append('photo', photoFile);
      
        if (this.#geoLocation) {
        submitFormData.append('lat', this.#geoLocation.coords.latitude);
        submitFormData.append('lon', this.#geoLocation.coords.longitude);
        }
      
        try {
        const response = await StoryModel.postNewStory(submitFormData);
        if (response.error) {
            this.#view.showSubmitError('Gagal mengunggah cerita.');
        } else {
            this.#view.showStoryAddedMessage();
            this.#view.navigateToHomepage();
        }
        } catch (error) {
            console.error('Submission error:', error);
            this.#view.showSubmitError('Gagal mengunggah cerita. Coba lagi.');
        }
    }


    destroy() {
        this.#stopMediaStream();
    }

}