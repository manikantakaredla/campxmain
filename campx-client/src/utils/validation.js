export const validateName = (name) => {

  if (!name.trim()) {
    return "Name is required";
  }

  if (name.length < 3) {
    return "Minimum 3 characters";
  }

  if (name.length > 50) {
    return "Maximum 50 characters";
  }

  if (!/^[A-Za-z ]+$/.test(name)) {
    return "Only letters allowed";
  }

  return "";
};

export const validateEmail = (email) => {

  if (!email.trim()) {
    return "Email is required";
  }

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return "Invalid email";
  }

  if (
    !email.endsWith(
      "@adityauniversity.in"
    )
  ) {
    return "Use university email";
  }

  return "";
};

export const validatePassword =
(password) => {

  if (!password) {
    return "Password required";
  }

  if (password.length < 8) {
    return "Minimum 8 characters";
  }

  if (password.length > 20) {
    return "Maximum 20 characters";
  }

  return "";
};