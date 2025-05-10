"use server";

import { AgentRepository } from "./repositories/agentRepository";
import {
  createSession,
  deleteSession,
  getSession,
} from "../sessions/agent_session";
import { redirect } from "next/navigation";

import { loginSchema, registerSchema } from "@/validation/validation-agent";
import { hashPassword, verifyPassword } from "@/lib/hashPassword";

const agentRepo = new AgentRepository();

export async function login(formData: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
      succes: false,
    };
  }
  try {
    const isAgent = await getAgentByEmail(result.data.Email);
    if (!isAgent) {
      return {
        errors: {
          email: ["Informations incorrectes"],
          succes: false,
        },
      };
    }
    const isPasswordCorrect = await verifyPassword(
      result.data.Password,
      isAgent.Password
    );
    if (!isPasswordCorrect) {
      return {
        errors: {
          password: ["Mot de passe incorrect"],
          succes: false,
        },
      };
    }

    await createSession(isAgent.ID_Agent, isAgent.Role);
    return {
      succes: false,
      errors: null,
    };
  } catch (error) {
    console.log(error);
  }
}

export async function register(formData: FormData) {
  const result = registerSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
      succes: false,
    };
  }
  try {
    const isAgent = await getAgentByEmail(result.data.Email);
    if (isAgent) {
      return {
        errors: {
          email: ["Cet email est déjà utilisé"],
          succes: false,
        },
      };
    }

    const hashedPassword = await hashPassword(result.data.Password);

    const newAgent = await agentRepo.create({
      data: {
        ...result.data,
        Password: hashedPassword,
      },
    });

    // await createSession(newAgent.ID_Agent, newAgent.Role);
    return {
      errors: null,
      succes: true,
    };
  } catch (e) {
    console.log(e);
    return {
      errors: e,
      succes: true,
    };
  }
}

export const getAgentById = async (id: string, withPassword?: boolean) => {
  const user = await agentRepo.findById(id);
  if (withPassword) {
    return user;
  }
  const agent = {
    ...user,
    Password: null,
  };
  return agent;
};
const getAgentByEmail = async (email: string) => {
  return await agentRepo.findByEmail(email);
};

export async function logout() {
  await deleteSession();
  redirect("/login");
}

export async function getAgent() {
  const session = await getSession();
  if (!session) return null;
  return await getAgentById(session?.userId as string);
}

export async function getAllAgents() {
  const agents = await agentRepo.findAll();
  return agents;
}
