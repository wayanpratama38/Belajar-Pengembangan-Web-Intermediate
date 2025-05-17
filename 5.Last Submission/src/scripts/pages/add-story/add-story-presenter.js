import StoryModel from '../../data/story-api';

export default class AddStoryPresenter {
  #view;
  #model;
  #mediaStream;

  constructor({ view }) {
    this.#model = StoryModel;
    this.#view = view;
    this.#mediaStream = null;
  }

  async initializeCamera() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.#view.showCameraError('Kamera tidak didukung oleh browser ini.');
        return;
      }
      this.#mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      this.#view.setCameraStream(this.#mediaStream);
    } catch (error) {
      console.error('Error Accessing camera: ', error);
      let message = 'Akses kamera ditolak atau kamera tidak ditemukan.';
      if (
        error.name === 'NotFoundError' ||
        error.name === 'DevicesNotFoundError'
      ) {
        message = 'Tidak ada kamera yang ditemukan.';
      } else if (
        error.name === 'NotAllowedError' ||
        error.name === 'PermissionDeniedError'
      ) {
        message =
          'Akses ke kamera tidak diizinkan. Periksa pengaturan browser Anda.';
      }
      this.#view.showCameraError(message);
      this.#stopMediaStream();
    }
  }

  capturePhoto() {
    if (!this.#mediaStream || !this.#mediaStream.active) {
      this.#view.showCameraError(
        'Stream kamera tidak aktif untuk mengambil foto.'
      );
      return null;
    }
    return this.#view.captureCameraFrame();
  }

  #stopMediaStream() {
    if (this.#mediaStream) {
      this.#mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
      this.#mediaStream = null;
    }
  }

  handleFileInput(file) {
    if (file) {
      this.#stopMediaStream();
    }
  }

  async submitStory(formData) {
    const description = formData.get('description');
    const photoFile = formData.get('photo');

    if (!description || !photoFile) {
      this.#view.showSubmitError('Deskripsi dan foto harus diisi!');
      return;
    }

    const submitFormData = new FormData();
    submitFormData.append('description', description);
    submitFormData.append('photo', photoFile);

    try {
      const response = await this.#model.postNewStory(submitFormData);
      if (response.error) {
        this.#view.showSubmitError('Gagal mengunggah cerita.');
      } else {
        this.#view.showStoryAddedMessage();
        this.#stopMediaStream();
        this.#view.navigateToHomepage();
      }
    } catch (error) {
      if (error.response && error.response.status === 413) {
        this.#view.showSubmitError(
          'Ukuran file masih terlalu besar untuk server.'
        );
      } else {
        this.#view.showSubmitError(
          'Terjadi kesalahan saat mengunggah cerita. Coba lagi.'
        );
      }
    } finally {
      this.#view.hideLoadingIndicatorForSubmit();
    }
  }

  destroy() {
    this.#stopMediaStream();
  }
}
