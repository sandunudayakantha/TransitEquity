import Joi from 'joi';

export const createFacilitySchema = Joi.object({
  name: Joi.string().required().trim().max(100).label('Facility Name'),
  type: Joi.string().valid('Bus Stop', 'Station', 'Parking', 'Bike Hub').required().label('Facility Type'),
  areaId: Joi.string().hex().length(24).required().label('Area ID'),
  coordinates: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required()
  }).required(),
  hasDisabledAccess: Joi.boolean().default(false),
  capacity: Joi.number().integer().min(0).required(),
  transportId: Joi.string().hex().length(24).optional().label('Transport ID')
});

export const updateFacilitySchema = Joi.object({
  name: Joi.string().trim().max(100),
  type: Joi.string().valid('Bus Stop', 'Station', 'Parking', 'Bike Hub'),
  areaId: Joi.string().hex().length(24),
  coordinates: Joi.object({
    lat: Joi.number().min(-90).max(90),
    lng: Joi.number().min(-180).max(180)
  }),
  hasDisabledAccess: Joi.boolean(),
  capacity: Joi.number().integer().min(0),
  transportId: Joi.string().hex().length(24).optional().label('Transport ID')
}).min(1);
