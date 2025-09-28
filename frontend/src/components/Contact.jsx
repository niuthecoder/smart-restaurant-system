import React, { useState } from 'react';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend } from 'react-icons/fi';
import { adminAPI } from '../services/api';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const contactData = {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        submissionDate: new Date().toISOString()
      };

      console.log('📞 Submitting contact form to backend:', contactData);
      
      await contactAPI.submitContact(contactData);
      
      alert('✅ Message sent successfully! We\'ll get back to you soon. 🍔');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
    } catch (error) {
      console.error('❌ Contact form submission failed:', error);
      alert('❌ Failed to send message. Please try again.');
    }
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Get In <span className="text-primary-500">Touch</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">Visit Us Today</h3>
            
            {/* Contact Cards */}
            <div className="space-y-6 mb-8">
              <div className="flex items-start p-6 bg-gray-50 rounded-2xl">
                <FiMapPin className="text-2xl text-primary-500 mt-1 mr-4" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Our Location</h4>
                  <p className="text-gray-600">123 Burger Street<br />Food District, NY 10001</p>
                </div>
              </div>

              <div className="flex items-start p-6 bg-gray-50 rounded-2xl">
                <FiPhone className="text-2xl text-primary-500 mt-1 mr-4" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Phone Number</h4>
                  <p className="text-gray-600">+1 (555) 123-BURGER<br />+1 (555) 123-DELIVER</p>
                </div>
              </div>

              <div className="flex items-start p-6 bg-gray-50 rounded-2xl">
                <FiMail className="text-2xl text-primary-500 mt-1 mr-4" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Email Address</h4>
                  <p className="text-gray-600">hello@burgerhouse.com<br />orders@burgerhouse.com</p>
                </div>
              </div>

              <div className="flex items-start p-6 bg-gray-50 rounded-2xl">
                <FiClock className="text-2xl text-primary-500 mt-1 mr-4" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Opening Hours</h4>
                  <p className="text-gray-600">
                    Mon-Thu: 11:00 AM - 10:00 PM<br />
                    Fri-Sat: 11:00 AM - 11:00 PM<br />
                    Sunday: 12:00 PM - 9:00 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl h-64 flex items-center justify-center text-gray-600">
              <div className="text-center">
                <div className="text-4xl mb-2">🗺️</div>
                <p>Interactive Map Would Go Here</p>
                <p className="text-sm">(Google Maps integration)</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="How can we help you?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Tell us more about your inquiry..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-primary-500 text-white py-4 rounded-xl font-semibold hover:bg-primary-600 transition-all transform hover:scale-105 flex items-center justify-center"
              >
                <FiSend className="mr-2" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;