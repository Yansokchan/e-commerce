import { SendIcon } from "lucide-react";
import { ClockFadingIcon } from "lucide-react";
import { HeadsetIcon } from "lucide-react";
export const ourSpecsData = [
  {
    title: "Free Shipping",
    description:
      "Enjoy fast, free delivery on every order no conditions, just reliable doorstep.",
    icon: SendIcon,
    accent: "#05DF72",
  },
  {
    title: "7 Days easy Return",
    description: "Change your mind? No worries. Return any item within 7 days.",
    icon: ClockFadingIcon,
    accent: "#FF8904",
  },
  {
    title: "24/7 Customer Support",
    description:
      "We're here for you. Get expert help with our customer support.",
    icon: HeadsetIcon,
    accent: "#A684FF",
  },
];
export const addressDummyData = {
  id: "addr_1",
  userId: "user_1",
  name: "John Doe",
  email: "johndoe@example.com",
  street: "123 Main St",
  city: "New York",
  state: "NY",
  zip: "10001",
  country: "USA",
  phone: "1234567890",
  createdAt: "Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)",
};

export const categories = [
  "Headphones",
  "Speakers",
  "Watch",
  "Earbuds",
  "Mouse",
  "Decoration",
];
export const couponDummyData = [
  {
    code: "NEW20",
    description: "20% Off for New Users",
    discount: 20,
    forNewUser: true,
    forMember: false,
    isPublic: false,
    expiresAt: "2026-12-31T00:00:00.000Z",
    createdAt: "2025-08-22T08:35:31.183Z",
  },
  {
    code: "NEW10",
    description: "10% Off for New Users",
    discount: 10,
    forNewUser: true,
    forMember: false,
    isPublic: false,
    expiresAt: "2026-12-31T00:00:00.000Z",
    createdAt: "2025-08-22T08:35:50.653Z",
  },
  {
    code: "OFF20",
    description: "20% Off for All Users",
    discount: 20,
    forNewUser: false,
    forMember: false,
    isPublic: false,
    expiresAt: "2026-12-31T00:00:00.000Z",
    createdAt: "2025-08-22T08:42:00.811Z",
  },
  {
    code: "OFF10",
    description: "10% Off for All Users",
    discount: 10,
    forNewUser: false,
    forMember: false,
    isPublic: false,
    expiresAt: "2026-12-31T00:00:00.000Z",
    createdAt: "2025-08-22T08:42:21.279Z",
  },
  {
    code: "PLUS10",
    description: "20% Off for Members",
    discount: 10,
    forNewUser: false,
    forMember: true,
    isPublic: false,
    expiresAt: "2027-03-06T00:00:00.000Z",
    createdAt: "2025-08-22T11:38:20.194Z",
  },
];
