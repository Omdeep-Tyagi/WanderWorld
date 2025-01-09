const Joi=require("joi");

// Schema for server side validation of listing
module.exports.listingSchema=Joi.object({ 
    listing:Joi.object({
        title:Joi.string().required(),
        description:Joi.string().required(),
        location:Joi.string().required(),
        country:Joi.string().required(),
        price:Joi.number().required().min(0),
        image:Joi.string().allow("",null),
        category:Joi.string().required(),
    }).required()////with every request listing object should be there
});

// Schema for server side validation of review
module.exports.reviewSchema=Joi.object({
    review:Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required()
})

