const scrollButton = document.getElementById('btn-scroll-top');

        window.onscroll = function() {
            if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                scrollButton.style.display = "block";
            } else {
                scrollButton.style.display = "none";
            }
        };

        scrollButton.onclick = function() {
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        };