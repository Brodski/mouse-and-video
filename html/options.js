
      window.addEventListener("load", doIt)

      function doIt() {
        console.log("hi")
        // let hints = []
        // hints.push(document.getElementById("volume_hint"))
        // hints.push(document.getElementById("seek_hint"))
        // hints.push(document.getElementById("everything_hint"))

        let volume_hint = document.getElementById("volume_hint");
        let seek_hint = document.getElementById("seek_hint");
        let everything_hint = document.getElementById("everything_hint");
        
        volume_hint.addEventListener("click", ()=> { makeVisibleListeners("img_vol") })
        seek_hint.addEventListener("click", ()=> { makeVisibleListeners("img_seek") })
        everything_hint.addEventListener("click", ()=> { makeVisibleListeners("img_every") })

        let modal = document.getElementsByClassName("modal-like")[0];
        let modalImages = document.getElementsByClassName("modal-middle")[0].getElementsByTagName('img');

        function makeVisibleListeners(imgId) {
          for (let i=0; i < modalImages.length; i++) {
            if (modalImages[i].classList.contains("visible")) {
              modalImages[i].classList.remove("visible")    
            }
          }
          document.getElementById(imgId).classList.toggle("visible")
          modal.classList.toggle("visible")

        }

      document.getElementsByClassName("modal-like")[0].addEventListener("click", () => { modal.classList.toggle("visible") })

        return
      }
