[![npm](https://img.shields.io/npm/v/@egomobile/next-utils.svg)](https://www.npmjs.com/package/@egomobile/next-utils)
[![last build](https://img.shields.io/github/workflow/status/egomobile/next-utils/Publish)](https://github.com/egomobile/next-utils/actions?query=workflow%3APublish)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/egomobile/next-utils/pulls)

# @egomobile/next-utils

> Handy utils and extensions for [Next.js 12+](https://nextjs.org/)

## Install

Execute the following command from your project folder, where your `package.json` file is stored:

```bash
npm install --save @egomobile/next-utils
```

## Usage

### withApiProps

The `createWithApiProps()` function can create a kind of middleware, which is a wrapper for [API routes](https://nextjs.org/docs/api-routes/introduction) with enhanced features like session and/or permission check(s).

```typescript
import { createWithApiProps } from "@egomobile/next-utils";

// s. options of 'createWithApiProps()'
interface IUserSession {}

// the best way is to create this 'withApiProps()'
// at a central place where all API routes an
// access and invoke it (s. below)
const withApiProps = createWithApiProps<IUserSession>({
  // (optional)
  checkSession: async (context) => {
    return {
      // return an object of type 'IUserSession'
      // or (false) to indicate, if a valid session
      // could not be found
    };
  },
});

export default withApiProps(
  {
    // (optional)
    // return props for all request handlers
    getProps: async ({ session }) => {
      // session: IUserSession

      return {
        props: {
          foo: "buzz",
          bar: 42,
        },
      };
    },

    GET: async ({ props, request, response }) => {
      // "buzz"
      const foo: string = props.foo;
      // 42
      const bar: number = props.bar;

      // return something e.g. ...
    },

    POST: async ({ props, request, response }) => {
      // same as in GETter
      // "buzz"
      const foo: string = props.foo;
      // 42
      const bar: number = props.bar;

      const body = request.body;

      // handle 'body' e.g. ...
    },

    // if a handler is not defined for a method
    // it will return 405 automatically
  },
  {
    // (optional)
    checkPermission: async ({ session }) => {
      // return a truthy value to indicate
      // if session (or its client) has enough
      // permission to access the resource
      // otherwise a 403 response is returned
    },
  }
);
```

### withServerSideProps

The `createWithServerSideProps()` function can create a kind of middleware, which is a wrapper for a [getServerSideProps](https://nextjs.org/docs/basic-features/data-fetching/get-server-side-props) with enhanced features like session and/or permission check(s).

```typescript
import type { NextPage } from "next";
import { createWithServerSideProps } from "@egomobile/next-utils";

// s. options of 'createWithApiProps()'
interface IUserSession {}

// the best way is to create this 'withServerSideProps()'
// at a central place where all server side render
// pages access to and can invoke it (s. below)
const withServerSideProps = createWithServerSideProps<IUserSession>({
  // (optional)
  checkSession: async (context) => {
    return {
      // return an object of type 'IUserSession'
      // or (false) to indicate, if a valid session
      // could not be found
    };
  },
});

// create 'getServerSideProps' constant, so Next.js knows
// to render this page on server side
export const getServerSideProps = withServerSideProps(
  async ({ session }) => {
    return {
      props: {
        foo: "buzz",
        bar: 42,
      },
    };
  },
  {
    checkPermission: async ({ session }) => {
      // return a truthy value to indicate
      // if session (or its client) has enough
      // permission to access the resource
      // otherwise a 403 response is returned
    },
  }
);

interface IMyServerSidePageProps {
  bar?: number;
  foo: string;
}

const MyServerSidePage: NextPage<IMyServerSidePageProps> = ({ foo, bar }) => {
  // foo => "buzz"
  // bar => 42

  return (
    // your JSX
  );
};

export default MyServerSidePage;
```

### withStaticProps

The `createWithServerSideProps()` function can create a kind of middleware, which is a wrapper for a [getStaticProps](https://nextjs.org/docs/basic-features/data-fetching/get-static-props) with enhanced features like default values for props.

```typescript
import type { NextPage } from "next";
import { createWithStaticProps } from "@egomobile/next-utils";

// the best way is to create this 'withStaticProps()'
// at a central place where all server side render
// pages access to and can invoke it (s. below)
const withStaticProps = createWithStaticProps({
  // this will be the default value
  // for 'revalidate' prop
  // for all pages, which using a 'getStaticProps'
  // value, which is created by this function
  revalidate: 3,
});

// create 'getServerSideProps' constant, so Next.js knows
// to render this page on server side
export const getStaticProps = withStaticProps(
  async ({ nextSession }) => {
    return {
      props: {
        foo: "buzz",
        bar: 42,
      },
    };
  }, {
    // this will be the default value
    // for 'revalidate' prop of this page
    // if upper action would not return an
    // own value for it
    revalidate: 3,
  }
);


interface IMyStaticSidePageProps {
  bar?: number;
  foo: string;
}

const MyStaticSidePage: NextPage<IMyStaticSidePageProps> = ({ foo, bar }) => {
  // foo => "buzz"
  // bar => 42

  return (
    // your JSX ...
  );
};

export default MyStaticSidePage;
```

## Credits

- [Next.js](https://nextjs.org/)
- [Filtrex](https://github.com/m93a/filtrex)
- [joi](https://joi.dev/)
- [sanitize-filename](https://github.com/parshap/node-sanitize-filename)

## See also

- [@egomobile/api-utils](https://github.com/egomobile/node-api-utils)
- [@egomobile/http-server](https://github.com/egomobile/node-http-server)
- [@egomobile/jobs](https://github.com/egomobile/node-jobs)
- [@egomobile/nodelike-utils](https://github.com/egomobile/nodelike-utils) and [@egomobile/node-utils](https://github.com/egomobile/node-utils) utils
- [@egomobile/types](https://github.com/egomobile/types)

## Documentation

The API documentation can be found [here](https://egomobile.github.io/next-utils/).
