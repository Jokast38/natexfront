export interface PasswordCriteria {
    hasLowercase: boolean;
    hasUppercase: boolean;
    hasNumber: boolean;
    hasMinLength: boolean;
    hasSpecialChar: boolean;
}

// Vérifie les critères de complexité du mot de passe
export const checkPasswordStrength = (password: string): PasswordCriteria => {
    return {
        hasLowercase: /[a-z]/.test(password),
        hasUppercase: /[A-Z]/.test(password),
        hasNumber: /\d/.test(password),
        hasMinLength: password.length >= 8,
        hasSpecialChar: /[!@#$%^&*()_+{}\[\]:;<>,.?/~\-]/.test(password)
    };
};

// Retourne un message d'erreur personnalisé selon les critères manquants
export const getPasswordErrorMessage = (criteria: PasswordCriteria): string | null => {
    const messages = [];
    if (!criteria.hasUppercase) messages.push("une lettre majuscule");
    if (!criteria.hasLowercase) messages.push("une lettre minuscule");
    if (!criteria.hasNumber) messages.push("un chiffre");
    if (!criteria.hasMinLength) messages.push("au moins 8 caractères");
    if (!criteria.hasSpecialChar) messages.push("un caractère spécial");

    if (messages.length === 0) return null;

    return `Le mot de passe doit contenir ${messages.join(", ").replace(/, ([^,]*)$/, " et $1")}.`;
};