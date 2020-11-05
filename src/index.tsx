import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import 'assets/css/index.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import URLS from 'URLS';
import GA from 'analytics';
import 'delayed-scroll-restoration-polyfill';

// Service and action imports
import { ThemeProvider } from 'context/ThemeContext';
import { useAuth } from 'api/hooks/Auth';
import { useMisc, MiscProvider } from 'api/hooks/Misc';
import { useUser, UserProvider } from 'api/hooks/User';
import { NewsProvider } from 'api/hooks/News';
import { JobPostProvider } from 'api/hooks/JobPost';
import { EventProvider } from 'api/hooks/Event';

// Project containers
import EventDetails from 'containers/EventDetails';
import Companies from 'containers/Companies';
import About from 'containers/About';
import ContactInfo from 'containers/ContactInfo';
import Admin from 'containers/Admin';
import UserAdmin from 'containers/UserAdmin';
import Events from 'containers/Events';
import Services from 'containers/Services';
import EventAdministration from 'containers/EventAdministration';
import NewStudent from 'containers/NewStudent';
import Profile from 'containers/Profile';
import JobPosts from 'containers/JobPosts';
import JobPostDetails from 'containers/JobPostDetails';
import JobPostAdministration from 'containers/JobPostAdministration';
import LogIn from 'containers/LogIn';
import ForgotPassword from 'containers/ForgotPassword';
import Laws from 'containers/Laws';
import NewLanding from 'containers/NewLanding';
import Http404 from 'containers/Http404';
import EventRegistration from 'containers/EventRegistration';
import SignUp from 'containers/SignUp';
import PrivacyPolicy from 'containers/PrivacyPolicy';
import Cheatsheet from 'containers/Cheatsheet';
import NewsDetails from 'containers/NewsDetails';
import News from 'containers/News';
import NewsAdministration from 'containers/NewsAdministration';
import EventRules from 'containers/EventRules';
import MessageGDPR from 'components/miscellaneous/MessageGDPR';

// The user needs to be authorized (logged in and member of an authorized group) to access these routes
const requireAuth = (OriginalComponent: React.ReactElement, accessGroups: Array<string> = []): React.ReactElement => {
  const App = (): React.ReactElement => {
    const location = useLocation();
    const { getUserData } = useUser();
    const { setLogInRedirectURL } = useMisc();
    const { isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [allowAccess, setAllowAccess] = useState(false);

    useEffect(() => {
      let isSubscribed = true;
      getUserData()
        .then((user) => {
          if (isSubscribed) {
            accessGroups.forEach((group) => {
              switch (group.toLowerCase()) {
                case 'hs':
                  if (user?.groups.includes('HS')) {
                    setAllowAccess(true);
                  }
                  break;
                case 'promo':
                  if (user?.groups.includes('Promo')) {
                    setAllowAccess(true);
                  }
                  break;
                case 'nok':
                  if (user?.groups.includes('NoK')) {
                    setAllowAccess(true);
                  }
                  break;
                case 'index':
                  if (user?.groups.includes('Index')) {
                    setAllowAccess(true);
                  }
                  break;
                default:
                  break;
              }
            });
            if (isAuthenticated() && accessGroups.length === 0) {
              setAllowAccess(true);
            }
            setIsLoading(false);
          }
        })
        .catch(() => {});
      return () => {
        isSubscribed = false;
      };
    }, [isAuthenticated, getUserData]);

    if (isLoading) {
      return <div>Autentiserer...</div>;
    } else if (!isAuthenticated()) {
      setLogInRedirectURL(location.pathname);
      return <Navigate to={URLS.login} />;
    } else if (allowAccess) {
      return OriginalComponent;
    } else {
      return <Navigate to={URLS.landing} />;
    }
  };

  return <App />;
};

type ProvidersProps = {
  children: React.ReactNode;
};

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <MiscProvider>
      <UserProvider>
        <NewsProvider>
          <JobPostProvider>
            <EventProvider>
              <ThemeProvider>{children}</ThemeProvider>
            </EventProvider>
          </JobPostProvider>
        </NewsProvider>
      </UserProvider>
    </MiscProvider>
  );
};

export const Application = () => {
  return (
    <Providers>
      <BrowserRouter>
        {GA.init() && <GA.RouteTracker />}
        <Routes>
          <Route element={<NewLanding />} path='/' />
          <Route path={URLS.events}>
            <Route element={<EventRegistration />} path=':id/registrering/' />
            <Route element={<EventDetails />} path=':id/*' />
            <Route element={<Events />} path='' />
          </Route>
          <Route element={<About />} path={URLS.about} />
          <Route element={<ContactInfo />} path={URLS.contactInfo} />
          <Route element={<Services />} path={URLS.services} />
          <Route element={<Companies />} path={URLS.company} />
          <Route element={<NewStudent />} path={URLS.newStudent} />
          <Route element={<Profile />} path={URLS.profile} />
          <Route path={URLS.jobposts}>
            <Route element={<JobPostDetails />} path=':id/*' />
            <Route element={<JobPosts />} path='' />
          </Route>
          <Route element={<Laws />} path={URLS.laws} />
          <Route element={<PrivacyPolicy />} path={URLS.privacyPolicy} />
          <Route element={<EventRules />} path={URLS.eventRules} />
          <Route path={URLS.news}>
            <Route element={<NewsDetails />} path=':id/*' />
            <Route element={<News />} path='' />
          </Route>

          <Route element={requireAuth(<Cheatsheet />)} path={`${URLS.cheatsheet}:studyId/:classId/`} />
          <Route element={requireAuth(<Cheatsheet />)} path={`${URLS.cheatsheet}*`} />

          <Route element={requireAuth(<Admin />, ['HS', 'Promo', 'Nok', 'Index'])} path={URLS.admin} />
          <Route element={requireAuth(<UserAdmin />, ['HS', 'Index'])} path={URLS.userAdmin} />
          <Route element={requireAuth(<JobPostAdministration />, ['HS', 'Nok', 'Index'])} path={URLS.jobpostsAdmin} />
          <Route element={requireAuth(<EventAdministration />, ['HS', 'Promo', 'Nok', 'Index'])} path={URLS.eventAdmin} />
          <Route element={requireAuth(<NewsAdministration />, ['HS', 'Promo', 'Nok', 'Index'])} path={URLS.newsAdmin} />

          <Route element={<LogIn />} path={URLS.login} />
          <Route element={<ForgotPassword />} path={URLS.forgotPassword} />
          <Route element={<SignUp />} path={URLS.signup} />

          <Route element={<Http404 />} path='*' />
        </Routes>
        <MessageGDPR />
      </BrowserRouter>
    </Providers>
  );
};

// eslint-disable-next-line no-console
console.log(
  '%cLaget av %cIndex',
  'font-weight: bold; font-size: 1rem;color: yellow;',
  'font-weight: bold; padding-bottom: 10px; padding-right: 10px; font-size: 3rem;color: yellow; text-shadow: 3px 3px 0 rgb(217,31,38), 6px 6px 0 rgb(226,91,14), 9px 9px 0 green, 12px 12px 0 rgb(5,148,68), 15px 15px 0 rgb(2,135,206), 18px 18px 0 rgb(4,77,145), 21px 21px 0 rgb(42,21,113)',
);
// eslint-disable-next-line no-console
console.log('%cSnoker rundt du? Det liker vi. Vi i Index ser alltid etter nye medlemmer.', 'font-weight: bold; font-size: 1rem;color: yellow;', '');

ReactDOM.render(<Application />, document.getElementById('root'));
