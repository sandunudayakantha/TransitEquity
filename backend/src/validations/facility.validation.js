const Joi =require('joi');

const createFacility = {
    body:Joi.object().keys({
     name: Joi.string().required().max(100).label('Facility Name'),
     type:Joi.string().valid('Bus Stop','Station','Parking','Bike Hub').required().label('Facility Type'),
     areaId: Joi.string().hex().length(24).required().label('Area ID'), 
     //Must be a valid Mongo ID
       coordinates: Joi.object ({
          lat: Joi.number().required(),
          lng: Joi.number().required()
         }).required(),
         hasDisabledAccess: Joi.boolean(),
         capacity: Joi.number().integer().min(0).required()
    }),
};

const updateFacility = {
      body: Joi.object().keys({
         name:Joi.string().max(100),
         type:Joi.string().valid('Bus stop', 'Station','Parking', 'Bike Hub'),
         areaId: Joi.string().hex().length(24),
         coordinates: Joi.object({
            lat: join.number(),
            lng:join.number()
         }),
         hasDisabledAccess: Joi.boolean(),
         capacity: Joi.number().integer.min(0)
     }),


};

module.exports = {
    createFacility,
    updateFacility,
};
