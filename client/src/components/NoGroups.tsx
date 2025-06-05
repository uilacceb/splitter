import CreateGroup from "./CreateGroup";

const NoGroups = () => {
  return (
    <>
      <div className="flex items-center pt-8 py-6 flex-col ">
        <h1 className="text-[3em] text-center md:text-[3.5em]">
          You don't have any group yet!
        </h1>
        <div className="w-full flex justify-end pr-6 pt-4">
          <CreateGroup />
        </div>
      </div>
    </>
  );
};

export default NoGroups;
