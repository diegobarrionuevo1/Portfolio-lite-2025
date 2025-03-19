import { Icons } from "@/components/icons";
import { CodeIcon, HomeIcon, NotebookIcon } from "lucide-react";

export const DATA = {
  name: "Diego",
  initials: "DB",
  pitch: "+2 años de experiencia en desarrollo web. Apasionado por las Startups y los modelos de negocios digitales.",
  url: "https://diegobarrionuevo.com",
  avatarUrl: "/me.jpeg",
  skills: [
    "React",
    "Next.js",
    "TypeScript",
    "Node.js",
    "Docker",
    "SQL",
    "NoSQL",
    "Automatización",
    "Integración de APIs"
  ],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "#work", icon: NotebookIcon, label: "Work" },
    { href: "#projects", icon: CodeIcon, label: "Projects" }
  ],
  contact: {
    email: "diegobarrionuevo11@gmail.com",
    tel: "+5493512092387",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/diegobarrionuevo1",
        icon: Icons.github,
        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/diegobarrionuevo11/",
        icon: Icons.linkedin,
        navbar: true,
      },
      email: {
        name: "Send Email",
        url: "mailto:diegobarrionuevo11@gmail.com",
        icon: Icons.email,
        navbar: false,
      },
    },
  },

  work: [
    {
      company: "Somos Hashi",
      href: "https://hashiapp.com",
      badges: [],
      location: "Remote",
      title: "Full Stack Developer",
      logoUrl: "/hashi.jpg",
      start: "Oct 2024",
      end: "Present",
      description:
        "Participé en el desarrollo del MVP de una plataforma de creación de contenido automatizado con IA, enfocándome en tareas de backend y optimización de bases de datos.",
    },
    {
      company: "DonWeb - Certificados",
      href: "https://donweb.com",
      badges: [],
      location: "Remote",
      title: "Líder Técnico y Backend Developer",
      logoUrl: "/donweb.jpg",
      start: "May 2023",
      end: "Jul 2023",
      description:
        "Lideré el desarrollo de una plataforma automatizada para la gestión de certificados y talleres en línea, integrando APIs de emails transaccionales y Zoom, asegurando escalabilidad y seguridad.",
    },
    {
      company: "Experiencia Freelance",
      href: "https://diegobarrionuevo.com",
      badges: [],
      location: "Remote",
      title: "Web Developer",
      logoUrl: "/freelance.jpg",
      start: "Mar 2022",
      end: "Present",
      description:
        "He implementado diversas soluciones, desde webs para comercios pequeños hasta aplicaciones para empresas de gran porte. Mis conocimientos en ingeniería me permitieron comprender en profundidad los requerimientos de los clientes e implementar las mejores soluciones.",
    },
  ],
  education: [
    {
      school: "Universidad Tecnológica Nacional",
      href: "https://www.frc.utn.edu.ar/",
      degree: "Ingeniería en Sistemas de Información",
      logoUrl: "/UTN_logo.jpg",
      start: "2018",
      end: "2022",
    },
  ],
  projects: [
    {
      title: "Plataforma de Certificados y Talleres",
      href: "https://donweb.com",
      dates: "May 2023 - Jul 2023",
      active: true,
      description:
        "Lideré el desarrollo de una plataforma automatizada para la gestión de certificados y talleres en línea, integrando APIs de emails transaccionales y Zoom.",
      technologies: [
        "Next.js",
        "TypeScript",
        "SQL",
        "Node.js",
        "Docker",
        "Automatización de Procesos",
      ],
      image: "",
      video:
        "https://pub-83c5db439b40468498f97946200806f7.r2.dev/chat-collect.mp4",
      links: [
        {
          type: "Website",
          href: "https://donweb.com",
          icon: <Icons.globe className="size-3" />,
        },
      ],
    },
    {
      title: "Somos Hashi - Plataforma IA",
      href: "https://hashiapp.com",
      dates: "Oct 2024 - Present",
      active: true,
      description:
        "Participé en el desarrollo del MVP de una plataforma de creación de contenido automatizado con IA, enfocándome en optimización de bases de datos y automatización de flujos.",
      technologies: [
        "React",
        "Next.js",
        "TypeScript",
        "SQL",
        "Node.js",
        "Docker",
      ],
      image: "",
      video: "https://cdn.magicui.design/bento-grid.mp4",
      links: [
        {
          type: "Website",
          href: "https://hashiapp.com",
          icon: <Icons.globe className="size-3" />,
        },
      ],
    },
  ],
} as const;
