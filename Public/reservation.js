document.addEventListener("DOMContentLoaded", function () {
    const reservationForm = document.getElementById("reservationForm");
    const confirmationMessage = document.getElementById("confirmationMessage");
    const reservationList = document.querySelector("#reservation-list tbody");

    // Fonction pour définir les détails du voyage dans le formulaire
    window.setReservationDetails = function (voyage, price) {
        document.getElementById("voyage").value = voyage;
        document.getElementById("price").value = price; // Envoi du prix sous forme de nombre
        document.getElementById("reservation").scrollIntoView({ behavior: 'smooth' });
    };

    // Gestion de la navigation fluide
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Soumission du formulaire
    reservationForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = {
            firstName: document.getElementById("firstName").value.trim(),
            lastName: document.getElementById("lastName").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            reservationDate: document.getElementById("reservationDate").value,
            reservationTime: document.getElementById("reservationTime").value,
            numberOfPeople: parseInt(document.getElementById("numberOfPeople").value, 10),
            price: parseFloat(document.getElementById("price").value),
            voyage: document.getElementById("voyage").value.trim(),
        };

        if (!formData.firstName || !formData.lastName || !formData.phone || !formData.reservationDate || !formData.reservationTime || !formData.numberOfPeople || isNaN(formData.price) || !formData.voyage) {
            alert("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        try {
            const response = await fetch('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                confirmationMessage.style.display = "block";
                reservationForm.reset();
                fetchReservations();
                document.getElementById("reservation-list").scrollIntoView({ behavior: 'smooth' });
            } else {
                alert("Une erreur est survenue lors de la réservation. Veuillez réessayer.");
            }
        } catch (error) {
            console.error("Erreur lors de la requête :", error);
            alert("Impossible de soumettre la réservation. Vérifiez votre connexion.");
        }
    });

    // Fonction pour récupérer et afficher les réservations
    async function fetchReservations() {
        try {
            const response = await fetch('/api/reservations');
            if (response.ok) {
                const reservations = await response.json();
                reservationList.innerHTML = ""; // Réinitialiser la liste

                reservations.forEach(reservation => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${reservation.reservationDate}</td>
                        <td>${reservation.reservationTime}</td>
                        <td>${reservation.firstName} ${reservation.lastName}</td>
                        <td>${reservation.numberOfPeople}</td>
                        <td>${reservation.phone}</td>
                    `;
                    reservationList.appendChild(row);
                });
            } else {
                alert("Erreur lors du chargement des réservations.");
            }
        } catch (error) {
            console.error("Erreur lors du chargement des réservations :", error);
        }
    }

    // Charger les réservations existantes à l'initialisation
    fetchReservations();
});
