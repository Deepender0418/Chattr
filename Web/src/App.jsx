const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      checkAuth();
    }
  }, [checkAuth]);

  // Show loading only on initial auth check when we don't have user data
  if (isCheckingAuth && !authUser && !hasCheckedAuth.current) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <Loader className="size-12 animate-spin text-primary" />
        <div className="text-center">
          <p className="text-lg font-semibold">Loading Chattr</p>
          <p className="text-sm text-base-content/60">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div data-theme={theme}>
      <Navbar />
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>
      <Toaster />
    </div>
  );
};
