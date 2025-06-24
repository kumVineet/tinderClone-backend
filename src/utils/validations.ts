import validator from "validator";
import { Request } from "express";

const validateSignupData = (req: Request): void => {
  const {
    firstName,
    lastName,
    email,
    password,
    month,
    date,
    year,
    gender,
    interest,
    lookingFor,
    hobbies,
    about,
    imageUrls,
  } = req.body.formfields;

  if (!firstName || !lastName) {
    throw new Error("Name is not valid");
  } else if (!validator.isEmail(email)) {
    throw new Error("Email is invalid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password is weak");
  }
  if (!date || !month || !year) {
    throw new Error("Date of birth is not valid");
  }
  if (!gender) {
    throw new Error("Gender is required");
  }
  if (!interest) {
    throw new Error("Interest is required");
  }
  if (!lookingFor.length) {
    throw new Error("LookingFor is required");
  }
  if (!hobbies.length) {
    throw new Error("At least 1 hobby is required");
  }
  if (!about) {
    throw new Error("About is required");
  }
  if (!imageUrls.length) {
    throw new Error("At least 1 image is required");
  }
};

const validateEditProfileData = (req: Request): boolean => {
  const ALLOWED_UPDATES = [
    "firstName",
    "lastName",
    "gender",
    "age",
    "about",
    // Photo keys (for database storage)
    "photo1_key",
    "photo2_key",
    "photo3_key",
    "photo4_key",
    // Photo URLs (for frontend display)
    "photo1",
    "photo2",
    "photo3",
    "photo4",
    "skills",
  ];

  const isEditAllowed = Object.keys(req.body).every((fields) =>
    ALLOWED_UPDATES.includes(fields)
  );
  return isEditAllowed;
};

export { validateSignupData, validateEditProfileData };
