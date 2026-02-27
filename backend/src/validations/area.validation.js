import Joi from 'joi';

export const createAreaSchema = Joi.object({
    name: Joi.string().required().trim().max(100).label('Area Name'),
    city: Joi.string().required().trim().max(100).label('City'),
    population: Joi.number().required().min(0).label('Population'),
    areaSize: Joi.number().required().min(0.01).label('Area Size'),
    coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90).required().label('Latitude'),
        lng: Joi.number().min(-180).max(180).required().label('Longitude')
    }).required().label('Coordinates')
});

export const updateAreaSchema = Joi.object({
    name: Joi.string().trim().max(100).label('Area Name'),
    city: Joi.string().trim().max(100).label('City'),
    population: Joi.number().min(0).label('Population'),
    areaSize: Joi.number().min(0.01).label('Area Size'),
    coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90).label('Latitude'),
        lng: Joi.number().min(-180).max(180).label('Longitude')
    })
}).min(1);
