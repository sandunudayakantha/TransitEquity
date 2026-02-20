const Facility =require('../models/Facility.model');

/**
 * create facility
 * @param {object} facilityData 
 * @returns 
 */
const createFacility =async(facilityData)=>{
     return await Facility.create(facilityData);
};

/**
 * Get all facilities (with Area details populated)
 * @returns {Promise<Array}
 */
const getAllFacilities = async() => {
    // .populate('areaId') joins the Facility table with Area table
    // so you can see the Area Name instead of just the ID.
    return await Facility.find().populate('areaId', 'name city');
};

/**
 * Get facility by ID
 * @param {string} id 
 * @returns {Promise<Facility>} 
 */
const getFacilityById =async (id) =>{
    return await Facility.findById(id).populate('areaId','name city');
};

/**
 * 
 * @param {string} id 
 * @param {object} updateData 
 * @returns {Promise<Facility>}
 */
const updateFacility = async (id, updateData) => {
    // {new : true } returns the updated document, not the old one
    return await Facility.findByIdAndUpdate(id,updateData ,{
        new:true, runValidators:true });
    };

/**
 * Delete facility  by ID
 * @param {string} id
 * @returns {Promise<Facility>}
 */   
const deleteFacility = async (id) =>{
    return await Facility.findByIdAndDelete(id);
};

module.exports = {
    createFacility,
    getAllFacilities,
    getFacilityById,
    updateFacility,
    deleteFacility

};