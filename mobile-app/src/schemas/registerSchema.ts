import * as Yup from 'yup';

export const StepOneSchema = Yup.object().shape({
    firstName: Yup.string()
        .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/, "Entrez un prenom valide")
        .min(2, "Entrez un prenom valide")
        .required(''),
    lastName: Yup.string()
        .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/, "Entrez un nom valide")
        .min(2, "Entrez un nom valide")
        .required(''),
});

export const StepTwoSchema = Yup.object().shape({
    email: Yup.string()
        .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Adresse email invalide')
        .required(''),
    password: Yup.string()
        .required('')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?/~\-])[A-Za-z\d!@#$%^&*()_+{}\[\]:;<>,.?/~\-]{8,}$/, 'Le mot de passe doit contenir au moins 8 caractères')
});