import Header from "./Header/Header.js";
import Register from "./Register.js";
import Login from "./Login.js";
import Main from "./Main.js";
import Footer from "./Footer.js";
import PopupWithForm from "./PopupWithForm.js";
import EditProfilePopup from "./EditProfilePopup.js";
import EditAvatarPopup from "./EditAvatarPopup.js";
import AddPlacePopup from "./AddPlacePopup.js";
import InfoTooltip from "./InfoTooltip.js";
import ImagePopup from "./ImagePopup.js";
import api from "../utils/api.js";
import ProtectedRoute from "./ProtectedRoute.js";
import * as auth from "../utils/apiAuth.js";
import {
  CurrentUserContext,
  defaultUser,
} from "../contexts/CurrentUserContext.js";

import AuthUserContext from "../contexts/AuthUserContext.js";

import usePopupClosing from "../hooks/usePopupClosing";

import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = React.useState(false);

  const [isTooltipSuccessful, setIsTooltipSuccessful] = React.useState(null);
  const [isTooltipOpen, setIsTooltipOpen] = React.useState(false);

  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] =
    React.useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] =
    React.useState(false);
  const [isImagePopupOpen, setIsImagePopupOpen] = React.useState(false);
  const [isConfirmPopupOpen, setIsConfirmPopupOpen] = React.useState(false);

  const [selectedCard, setSelectedCard] = React.useState(null);
  const [currentUser, setCurrentUser] = React.useState(defaultUser);
  const [authUser, setAuthUser] = React.useState({ email: "" });
  const [cards, setCards] = React.useState([]);

  const isPopupOpen =
    isEditProfilePopupOpen ||
    isAddPlacePopupOpen ||
    isEditAvatarPopupOpen ||
    isConfirmPopupOpen ||
    isImagePopupOpen ||
    isTooltipOpen;

  const { escClose, clickClose } = usePopupClosing(isPopupOpen, closeAllPopups);
  React.useEffect(escClose, [isPopupOpen, escClose]);

  React.useEffect(() => {

    // automatic login if user has valid jwt in httpOnly cookies
    auth
      .authorize()
      .then((data) => {
        if (data && data.email) {
          setLoggedIn(true);
          setAuthUser(data);
          navigate("/", { replace: true });
        }
    })
    // 401 error goes to catch, it's ok if jwt expired or doesnt exist, therefore just console.log
    .catch(console.log);

    // fetch data if user is loggined,
    if (loggedIn) {
      Promise.all([api.getUserMe(), api.getCards()])
        .then(([userData, cardsData]) => {
          setCurrentUser(userData);
          setCards(cardsData);
        })
        .catch(reportError);
    }

  }, [navigate, loggedIn]);

  function closeAllPopups() {
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setIsImagePopupOpen(false);
    setIsConfirmPopupOpen(false);
    setSelectedCard(null);
    setIsTooltipOpen(false);
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(!isEditAvatarPopupOpen);
  }

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(!isEditProfilePopupOpen);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(!isAddPlacePopupOpen);
  }

  function handleCardClick(card) {
    setSelectedCard(card);
    setIsImagePopupOpen(true);
  }

  function handleLikeClick(card) {
    const isLiked = card.likes.some((like) => currentUser._id === like._id);
    if (isLiked) {
      api.deleteLike(card._id).then(updateCardsList).catch(reportError);
    } else {
      api.putLike(card._id).then(updateCardsList).catch(reportError);
    }
  }

  function handleCardDelete(card) {
    setSelectedCard(card);
    setIsConfirmPopupOpen(true);
  }

  function handleConfirmCardDelete(evt) {
    evt.preventDefault();
    if (currentUser._id === selectedCard.owner._id) {
      api
        .deleteCard(selectedCard._id)
        .then(() => {
          cutCardsList(selectedCard);
          closeAllPopups();
        })
        .catch(reportError);
    }
  }

  function updateCardsList(updCard) {
    setCards((stateCards) =>
      stateCards.map((card) => (card._id === updCard._id ? updCard : card))
    );
  }

  function cutCardsList(cutCard) {
    setCards((stateCards) =>
      stateCards.filter((card) => card._id !== cutCard._id)
    );
  }

  function handleUpdateUser({ name, about }, setInitialBtnText) {
    api
      .patchUserMe(name, about)
      .then((updUser) => {
        setCurrentUser(updUser);
        closeAllPopups();
      })
      .catch(reportError)
      .finally(setInitialBtnText);
  }

  function handleUpdateAvatar({ link }, setInitialBtnText) {
    api
      .patchUserMeAvatar(link)
      .then((updUser) => {
        setCurrentUser(updUser);
        closeAllPopups();
      })
      .catch(reportError)
      .finally(setInitialBtnText);
  }

  function handleAddPlaceSubmit({ link, name }, setInitialBtnText) {
    api
      .postCard(link, name)
      .then((newCard) => {
        setCards([newCard, ...cards]);
        closeAllPopups();
      })
      .catch(reportError)
      .finally(setInitialBtnText);
  }

  // Auth

  function handleRegister(email, password) {
    auth
      .register(email, password)
      .then(() => {
        navigate("/sign-in", { replace: true });
        setIsTooltipSuccessful(true);
      })
      .catch((err) => {
        reportError(err);
        setIsTooltipSuccessful(false);
      })
      .finally(() => setIsTooltipOpen(true));
  }

  function handleLogin(email, password) {
    auth
      .login(email, password)
      .then(() => {
        setLoggedIn(true);
        navigate("/", { replace: true });
      })
      .catch((err) => {
        reportError(err);
        setIsTooltipSuccessful(false);
        setIsTooltipOpen(true);
      });
  }

  function handleLogout() {
    auth
      .logout()
      .then(() => {
        setLoggedIn(false);
        setAuthUser({ email: "" });
        navigate("/sign-in", { replace: true });
      })
      .catch(reportError);
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <AuthUserContext.Provider value={{ loggedIn, authUser }}>
        <Header onLogout={handleLogout} />

        <Routes>
          <Route
            path="/sign-up"
            element={<Register onRegister={handleRegister} />}
          />
          <Route path="/sign-in" element={<Login onLogin={handleLogin} />} />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/"
              element={
                <Main
                  cards={cards}
                  onEditProfile={handleEditProfileClick}
                  onAddPlace={handleAddPlaceClick}
                  onEditAvatar={handleEditAvatarClick}
                  handleCardClick={handleCardClick}
                  handleLikeClick={handleLikeClick}
                  handleCardDelete={handleCardDelete}
                />
              }
            />
          </Route>
        </Routes>

        <EditProfilePopup
          isOpen={isEditProfilePopupOpen}
          onUpdateUser={handleUpdateUser}
          onClose={clickClose}
        />

        <EditAvatarPopup
          isOpen={isEditAvatarPopupOpen}
          onUpdateAvatar={handleUpdateAvatar}
          onClose={clickClose}
        />

        <AddPlacePopup
          isOpen={isAddPlacePopupOpen}
          onAddPlace={handleAddPlaceSubmit}
          onClose={clickClose}
        />

        <ImagePopup
          isOpen={isImagePopupOpen}
          card={selectedCard}
          onClose={clickClose}
        />

        <InfoTooltip
          isOpen={isTooltipOpen}
          isSuccessful={isTooltipSuccessful}
          onClose={clickClose}
        />

        {/* popup confirm a card deletion */}
        <PopupWithForm
          name="confirm"
          title="Вы уверены?"
          saveBtnText="Да"
          isOpen={isConfirmPopupOpen}
          onSubmit={handleConfirmCardDelete}
          isValid={true}
          onClose={clickClose}
        />

        <Footer />
      </AuthUserContext.Provider>
    </CurrentUserContext.Provider>
  );
}

export default App;
