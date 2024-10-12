Användar- och Administrationssystem med Hash & Salt samt JWT.

Detta projekt är en användarautentisering och rollhanteringssystem byggt med Node.js, Express, MongoDB, och React. Systemet använder JSON Web Tokens (JWT) för att autentisera användare och hantera åtkomsträttigheter baserat på roller. Det ger en grundläggande struktur för att skapa en säker och skalbar webbapplikation där användare kan logga in, registrera sig och navigera mellan olika sidor beroende på deras behörighet.


Funktioner.

Registrering av användare: Användare kan registrera sig med ett användarnamn och lösenord.
Inloggning med JWT: När användaren loggar in genereras en JWT-token som används för att autentisera användarens session.
Rollhantering: Användare tilldelas olika roller (t.ex. 'user', 'admin', 'superuser'), vilket avgör vilken åtkomst de har i systemet.
Skyddade rutter: Endast inloggade användare med rätt roller kan komma åt specifika sidor, vilket förhindrar obehörig åtkomst.
Frontend och Backend: En React-baserad frontend kommunicerar med en Express-baserad backend via Axios för att hämta och skicka data.
Teknologier
Backend: Node.js, Express, MongoDB (med Mongoose), JWT, bcrypt för lösenordshashning
Frontend: React, Axios för HTTP-förfrågningar
Autentisering: JSON Web Tokens (JWT) för säkra sessioner.




Användning.

Registrera en ny användare via registreringsformuläret.
Logga in med registrerade uppgifter för att få åtkomst till användarsidan.
Om användaren har administratörsroll kan de navigera till administrationssidan, där de har möjlighet att utföra admin-specifika uppgifter.
