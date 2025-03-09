import { BorderBeam } from './magicui/border-beam';
import { StarIcon } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  content: string;
}

interface StudentTestimonialsProps {
  testimonials: Testimonial[];
}

export function StudentTestimonials({ testimonials }: StudentTestimonialsProps) {
  return (
    <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
      {testimonials.map((testimonial, index) => (
        <BorderBeam key={index} duration={4} size={0.5} className="opacity-20 mb-8">
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:shadow-black/20 flex flex-col h-full">
            <div className="flex-1 mb-6">
              <div className="flex items-center mb-6">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-[#aaaaaa] fill-[#aaaaaa] mr-1" />
                ))}
              </div>
              <p className="mb-6 text-[#aaaaaa] italic leading-relaxed">"{testimonial.content}"</p>
            </div>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-[#222222] border border-[#333333] flex items-center justify-center text-white font-bold text-lg mr-4">
                {testimonial.name.charAt(0)}
              </div>
              <div>
                <div className="font-medium text-white">{testimonial.name}</div>
                <div className="text-[#777777]">{testimonial.role}</div>
              </div>
            </div>
          </div>
        </BorderBeam>
      ))}
    </div>
  );
} 