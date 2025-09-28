import React from 'react';
import { FiClock, FiStar, FiUsers, FiAward } from 'react-icons/fi';

const About = () => {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Our <span className="text-primary-500">Story</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From a small family recipe to the city's favorite burger destination
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Story Content */}
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Crafting Perfect Burgers Since 2010
            </h3>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                What started as a humble food truck with a secret family recipe has grown into 
                Burger House - your go-to destination for the most delicious, juicy burgers in town. 
                Our founder, Chef Marco, believed that everyone deserves a perfect burger experience.
              </p>
              <p>
                We source only the finest ingredients - from locally-grown vegetables to premium 
                Angus beef. Every burger is crafted with passion and attention to detail that 
                you can taste in every bite.
              </p>
              <p>
                Today, we're proud to serve over 10,000 satisfied customers every week, 
                but we've never lost sight of what made us special: quality, consistency, 
                and that homemade taste.
              </p>
            </div>

            {/* Signature */}
            <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg">
              <p className="text-lg italic text-gray-700 mb-2">
                "Every burger tells a story. Ours is one of passion, quality, and the pursuit of perfection."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  MH
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">Marco Hernandez</div>
                  <div className="text-primary-600">Founder & Head Chef</div>
                </div>
              </div>
            </div>
          </div>

          {/* Image/Stats */}
          <div className="relative">
            {/* Placeholder for restaurant image */}
            <div className="bg-gradient-to-br from-primary-400 to-secondary-500 rounded-3xl h-96 flex items-center justify-center text-white text-6xl">
              🍔
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <FiUsers className="text-3xl text-primary-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">50K+</div>
                <div className="text-gray-600">Happy Customers</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <FiStar className="text-3xl text-primary-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">4.9</div>
                <div className="text-gray-600">Average Rating</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <FiClock className="text-3xl text-primary-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">13</div>
                <div className="text-gray-600">Years Experience</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <FiAward className="text-3xl text-primary-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">12</div>
                <div className="text-gray-600">Awards Won</div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-8">Our Values</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🌱</div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Fresh Ingredients</h4>
              <p className="text-gray-600">We use only the freshest, locally-sourced ingredients in every dish.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">👨‍🍳</div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Expert Craftsmanship</h4>
              <p className="text-gray-600">Our chefs bring years of experience and passion to every burger.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">❤️</div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Community Love</h4>
              <p className="text-gray-600">We're proud to be part of the local community that supports us.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;