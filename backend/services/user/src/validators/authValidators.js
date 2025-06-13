const Joi = require('joi');

const authSchemas = {
  register: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .max(255)
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
        'string.max': 'Email must not exceed 255 characters'
      }),
    
    password: Joi.string()
      .min(8)
      .max(128)
      .required()
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password must not exceed 128 characters',
        'any.required': 'Password is required',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      }),
    
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.alphanum': 'Username must only contain alphanumeric characters',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username must not exceed 30 characters',
        'any.required': 'Username is required'
      }),
    
    fullName: Joi.string()
      .min(2)
      .max(255)
      .optional()
      .messages({
        'string.min': 'Full name must be at least 2 characters long',
        'string.max': 'Full name must not exceed 255 characters'
      })
  }),
  
  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  }),
  
  refreshToken: Joi.object({
    refreshToken: Joi.string()
      .required()
      .messages({
        'any.required': 'Refresh token is required'
      })
  }),
  
  forgotPassword: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      })
  }),
  
  resetPassword: Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'Reset token is required'
      }),
    
    newPassword: Joi.string()
      .min(8)
      .max(128)
      .required()
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password must not exceed 128 characters',
        'any.required': 'Password is required',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      })
  }),
  
  changePassword: Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'Current password is required'
      }),
    
    newPassword: Joi.string()
      .min(8)
      .max(128)
      .required()
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password must not exceed 128 characters',
        'any.required': 'Password is required',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      })
      .invalid(Joi.ref('currentPassword'))
      .messages({
        'any.invalid': 'New password must be different from current password'
      })
  }),
  
  verifyEmail: Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'Verification token is required'
      })
  }),
  
  verify2FA: Joi.object({
    code: Joi.string()
      .length(6)
      .pattern(/^\d+$/)
      .required()
      .messages({
        'string.length': 'Authentication code must be 6 digits',
        'string.pattern.base': 'Authentication code must contain only numbers',
        'any.required': 'Authentication code is required'
      }),
    
    tempToken: Joi.string()
      .optional()
  }),
  
  disable2FA: Joi.object({
    code: Joi.string()
      .length(6)
      .pattern(/^\d+$/)
      .required()
      .messages({
        'string.length': 'Authentication code must be 6 digits',
        'string.pattern.base': 'Authentication code must contain only numbers',
        'any.required': 'Authentication code is required'
      })
  })
};

const userSchemas = {
  updateProfile: Joi.object({
    fullName: Joi.string()
      .min(2)
      .max(255)
      .optional()
      .messages({
        'string.min': 'Full name must be at least 2 characters long',
        'string.max': 'Full name must not exceed 255 characters'
      }),
    
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .optional()
      .messages({
        'string.alphanum': 'Username must only contain alphanumeric characters',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username must not exceed 30 characters'
      }),
    
    avatarUrl: Joi.string()
      .uri()
      .optional()
      .messages({
        'string.uri': 'Avatar URL must be a valid URL'
      })
  }),
  
  updateEmail: Joi.object({
    newEmail: Joi.string()
      .email()
      .required()
      .max(255)
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
        'string.max': 'Email must not exceed 255 characters'
      }),
    
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required to change email'
      })
  })
};

module.exports = {
  authSchemas,
  userSchemas
};